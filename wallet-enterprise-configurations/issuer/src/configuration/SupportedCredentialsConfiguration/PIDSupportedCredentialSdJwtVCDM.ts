import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat } from "core/dist/types";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { formatDateDDMMYYYY } from "../../lib/formatDate";
import { urlToDataUrl } from "../../lib/urlToDataUrl";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import base64url from "base64url";
import { Request } from "express";
import { issuerSigner } from "../issuerSigner";
import { parsePidData } from "../datasetParser";
import path from "node:path";
import fs from 'fs';
import { AuthenticationChain, AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
import { initializeCredentialEngine } from "../../lib/initializeCredentialEngine";

const datasetName = "vid-dataset.xlsx";
parsePidData(path.join(__dirname, `../../../../dataset/${datasetName}`)) // test parse

export class PIDSupportedCredentialSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getAuthenticationChain(): AuthenticationChain {
		return new AuthenticationChainBuilder()
			.addAuthenticationComponent(new GenericLocalAuthenticationComponent(this.getScope() + "-1-local", CONSENT_ENTRYPOINT, {
				"pid_id": { datasetColumnName: "pid_id", parser: (val: any) => String(val) },
			},
				async () => parsePidData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
				[{ username: "john", password: "secret" }, { username: "emily", password: "secret" }]
			))
			// .addAuthenticationComponent(new LocalAuthenticationComponent2("2-local", CONSENT_ENTRYPOINT))
			.build();
	}

	getScope(): string {
		return "pid:sd_jwt_vc";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:eudi:pid:1";
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PID", this.getId()];
	}

	getDisplay() {
		return {
			name: "PID SD-JWT VC",
			description: "Person Identification Data - SD-JWT VC",
			background_image: { uri: config.url + "/images/background-image.png" },
			background_color: "#1b263b",
			text_color: "#FFFFFF",
			locale: 'en-US',
		}
	}

	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.pid_id) {
			return null;
		}
		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));

		if (!users) {
			console.error("Failed to load users")
			return null;
		}

		const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template-pid.svg"), 'utf-8');
		const vids = users.filter(u => String(u.pid_id) == userSession?.pid_id);
		const credentialViews: CredentialView[] = await Promise.all(vids
			.map(async (vid) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: vid.family_name },
					{ name: "Family Name at Birth", value: vid.family_name_birth },
					{ name: "Given Name", value: vid.given_name },
					{ name: "Given Name at Birth", value: vid.given_name_birth },
					{ name: "Document Number", value: vid.document_number },
					{ name: "Birth Date", value: formatDateDDMMYYYY(vid.birth_date) },
					{ name: "Age Over 18", value: vid.age_over_18 },
					{ name: "Sex", value: vid.sex },
					{ name: "Nationality", value: vid.nationality},
					{ name: "Birth Place", value: vid.birth_country },
					{ name: "Resident Address", value: vid.resident_address },
					{ name: "Email Address", value: vid.email_address },
					{ name: "Mobile Phone", value: vid.mobile_phone_number },
					{ name: "Expiry Date", value: formatDateDDMMYYYY(vid.expiry_date) },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				const { credentialRendering } = initializeCredentialEngine();
				const dataUri = await credentialRendering.renderSvgTemplate({
					json: {...vid},
					credentialImageSvgTemplate: svgText,
					sdJwtVcMetadataClaims: this.metadata().claims,
				})
				console.log("Data uri = ", dataUri);
				if (!dataUri) {
					throw new Error("Could not render svg");
				}
				
				return {
					credential_id: this.getId(),
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					credential_image: dataUri,
				}
			}));
		return credentialViews[0];
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, request: Request, holderPublicKeyJwk: JWK): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession?.pid_id) {
			console.log("Cannot generate credential: pid_id is missing")
			throw new Error("Cannot generate credential: pid_id is missing");
		}

		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));

		if (!users) {
			throw new Error("Failed to get users from dataset");
		}

		if (request.body?.vct != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
			console.log("Not the correct credential");
			throw new Error("Not the correct credential");
		}

		const vidEntry = users?.filter(u => String(u.pid_id) == userSession.pid_id)[0];
		if (!vidEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}

		const vid = {
			family_name: vidEntry.family_name,
			birth_family_name: vidEntry.family_name_birth,
			given_name: vidEntry.given_name,
			birth_given_name: vidEntry.given_name_birth,
			place_of_birth: {
				country: vidEntry.birth_country,
				region: vidEntry.birth_region,
				locality: vidEntry.birth_city
			},
			address: {
				formatted: vidEntry.resident_address,
				country: vidEntry.resident_country,
				region: vidEntry.resident_region,
				locality: vidEntry.resident_city,
				postal_code: vidEntry.resident_postal_code,
				street_address: vidEntry.resident_street,
				house_number: vidEntry.resident_house_number
			},
			age_equal_or_over: {
				"18": vidEntry.age_over_18 == '1' ? true : false,
				"16": vidEntry.age_over_16 == '1' ? true : false,
				"65": vidEntry.age_over_65 == '1' ? true : false,
			},
			age_over_21: vidEntry.age_over_21 == '1' ? true : false,
			age_in_years: vidEntry.age_in_years,
			age_birth_year: vidEntry.age_birth_year,
			birth_date: new Date(vidEntry.birth_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			issuing_authority: vidEntry.issuing_authority,
			issuing_country: vidEntry.issuing_country,
			document_number: String(vidEntry.document_number),
			date_of_issuance: new Date().toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			date_of_expiry: new Date(vidEntry.expiry_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			sex: vidEntry.sex,
			nationalities: vidEntry.nationality.split(','),
			email: vidEntry.email_address,
			phone_number: vidEntry.mobile_phone_number,
			picture: vidEntry.sex == '1' ? await urlToDataUrl(config.url + "/images/male_portrait.jpg") : await urlToDataUrl(config.url + "/images/female_portrait.jpg"),
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:vid:${randomUUID()}`,
			...vid,
		};

		const disclosureFrame = {
			family_name: true,
			birth_family_name: true,
			given_name: true,
			birth_given_name: true,
			place_of_birth: {
				country: true,
				region: true,
				locality: true
			},
			address: {
				formatted: true,
				country: true,
				region: true,
				locality: true,
				postal_code: true,
				street_address: true,
				house_number: true
			},
			age_equal_or_over: {
				"18": true,
				"16": true,
				"65": true,
			},
			age_over_21: true,
			age_in_years: true,
			age_birth_year: true,
			birth_date: true,
			issuing_authority: true,
			issuing_country: true,
			document_number: true,
			date_of_issuance: true,
			date_of_expiry: true,
			sex: true,
			nationalities: true,
			email: true,
			phone_number: true,
			picture: true
		}
		const { credential } = await this.getCredentialSigner()
			.signSdJwtVc(payload, { typ: VerifiableCredentialFormat.VC_SDJWT, vctm: [base64url.encode(JSON.stringify(this.metadata()))] }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: credential
		};

		return response;
	}

	public metadata(): any {
		return {
			"vct": this.getId(),
			"name": "PID",
			"description": "This is a PID document issued by the well known PID Issuer",
			"display": [
				{
					"lang": "en-US",
					"name": "PID",
					"rendering": {
						"simple": {
							"logo": {
								"uri": config.url + "/images/logo.png",
								"uri#integrity": "sha256-acda3404c2cf46da192cf245ccc6b91edce8869122fa5a6636284f1a60ffcd86",
								"alt_text": "PID Logo"
							},
							"background_color": "#4cc3dd",
							"text_color": "#FFFFFF"
						},
						"svg_templates": [
							{
								"uri": config.url + "/images/template-pid.svg",
							}
						],
					}
				}
			],
			"claims": [
				{
					"path": ["given_name"],
					"display": [
						{
							"lang": "en-US",
							"label": "Given Name",
							"description": "The given name of the PID holder"
						}
					],
					"svg_id": "given_name"
				},
				{
					"path": ["family_name"],
					"display": [
						{
							"lang": "en-US",
							"label": "Family Name",
							"description": "The family name of the PID holder"
						}
					],
					"svg_id": "family_name"
				},
				{
					"path": ["birth_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Birth date",
							"description": "The birth date of the PID holder"
						}
					],
					"svg_id": "birth_date"
				},
				{
					"path": ["issuing_authority"],
					"display": [
						{
							"lang": "en-US",
							"label": "Issuing authority",
							"description": "The issuing authority of the PID credential"
						}
					],
					"svg_id": "issuing_authority"
				},
				{
					"path": ["date_of_issuance"],
					"display": [
						{
							"lang": "en-US",
							"label": "Issuance date",
							"description": "The date that the credential was issued"
						}
					],
					"svg_id": "issuance_date"
				},
				{
					"path": ["date_of_expiry"],
					"display": [
						{
							"lang": "en-US",
							"label": "Expiry date",
							"description": "The date that the credential will expire"
						}
					],
					"svg_id": "expiry_date"
				}
			],
		}

	}

	exportCredentialSupportedObject(): any {
		return {
			scope: this.getScope(),
			vct: this.getId(),
			display: [this.getDisplay()],
			format: this.getFormat(),
			cryptographic_binding_methods_supported: ["ES256"],
			credential_signing_alg_values_supported: ["ES256"],
			proof_types_supported: {
				jwt: {
					proof_signing_alg_values_supported: ["ES256"]
				}
			}
		}
	}
}
