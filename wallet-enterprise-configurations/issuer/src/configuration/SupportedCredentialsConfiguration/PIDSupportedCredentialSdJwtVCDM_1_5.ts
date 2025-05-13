import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat } from "wallet-common/dist/types";
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

export class PIDSupportedCredentialSdJwtVCDM_1_5 implements VCDMSupportedCredentialProtocol {


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
		return "pid:sd_jwt_vc:arf_1_5";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:eu.europa.ec.eudi:pid:1";
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PID", this.getId()];
	}

	getDisplay() {
		return {
			name: "ARF 1.5 PID SD-JWT VC",
			description: "Person Identification Data",
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
					{ name: "Last Name", value: vid.family_name },
					{ name: "Birth Last Name", value: vid.family_name_birth },
					{ name: "First Name", value: vid.given_name },
					{ name: "Birth First Name", value: vid.given_name_birth },
					{ name: "Personal ID", value: vid.personal_administrative_number },
					{ name: "Date of birth", value: formatDateDDMMYYYY(vid.birth_date) },
					{ name: "Sex", value: vid.sex },
					{ name: "Full address", value: vid.resident_address },
					{ name: "Residence street", value: vid.resident_street },
					{ name: "Residence number", value: vid.resident_house_number },
					{ name: "Residence ZIP", value: vid.resident_postal_code },
					{ name: "City of residence", value: vid.resident_city },
					{ name: "State of residence", value: vid.resident_region },
					{ name: "Country of residence", value: vid.resident_country },
					{ name: "Email", value: vid.email_address },
					{ name: "Mobile", value: vid.mobile_phone_number },
					{ name: "Age Over 14", value: vid.age_over_14 },
					{ name: "Age Over 16", value: vid.age_over_16 },
					{ name: "Age Over 18", value: vid.age_over_18 },
					{ name: "Age Over 21", value: vid.age_over_21 },
					{ name: "Age Over 65", value: vid.age_over_65 },
					{ name: "Age", value: vid.age_in_years },
					{ name: "Birth Year", value: vid.age_birth_year },
					{ name: "Place of Βirth", value: vid.birth_place },
					{ name: "Nationality", value: vid.nationality },
					{ name: "Issuing Authority", value: vid.issuing_authority },
					{ name: "Issuing Country", value: vid.issuing_country },
					{ name: "Issuing Region", value: vid.issuing_jurisdiction },
					{ name: "Document Number", value: vid.document_number }
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				const { credentialRendering } = await initializeCredentialEngine();
				const dataUri = await credentialRendering.renderSvgTemplate({
					json: { ...vid,
						expiry_date: undefined,
						issuance_date: undefined
					 },
					credentialImageSvgTemplate: svgText,
					sdJwtVcMetadataClaims: this.metadata().claims,
				})

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
			given_name: vidEntry.given_name,
			birth_family_name: vidEntry.family_name_birth,
			birth_given_name: vidEntry.given_name_birth,
			sex: vidEntry.sex,
			email_address: vidEntry.email_address,
			mobile_phone_number: vidEntry.mobile_phone_number,
			resident_address: vidEntry.resident_address,
			resident_street_address: vidEntry.resident_street,
			resident_house_number: vidEntry.resident_house_number,
			resident_postal_code: String(vidEntry.resident_postal_code),
			resident_city: vidEntry.resident_city,
			resident_state: vidEntry.resident_region,
			resident_country: vidEntry.resident_country,
			personal_administrative_number: vidEntry.personal_administrative_number,
			age_over_14: String(vidEntry.age_over_14) == '1' ? true : false,
			age_over_18: String(vidEntry.age_over_18) == '1' ? true : false,
			age_over_16: String(vidEntry.age_over_16) == '1' ? true : false,
			age_over_21: String(vidEntry.age_over_21) == '1' ? true : false,
			age_over_65: String(vidEntry.age_over_65) == '1' ? true : false,
			age_in_years: vidEntry.age_in_years,
			age_birth_year: vidEntry.age_birth_year,
			document_number: String(vidEntry.document_number),
			birth_date: new Date(vidEntry.birth_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			issuing_authority: vidEntry.issuing_authority,
			issuing_country: vidEntry.issuing_country,
			issuing_jurisdiction: vidEntry.issuing_jurisdiction,
			issuance_date: new Date().toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			expiry_date: new Date(vidEntry.expiry_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			birth_place: vidEntry.birth_place,
			nationality: vidEntry.nationality.split(','),
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
			given_name: true,
			birth_family_name: true,
			birth_given_name: true,
			sex: true,
			email_address: true,
			mobile_phone_number: true,
			resident_address: true,
			resident_street_address: true,
			resident_house_number: true,
			resident_postal_code: true,
			resident_city: true,
			resident_state: true,
			resident_country: true,
			personal_administrative_number: true,
			age_over_14: true,
			age_over_18: true,
			age_over_16: true,
			age_over_21: true,
			age_over_65: true,
			age_in_years: true,
			age_birth_year: true,
			document_number: true,
			birth_date: true, 
			issuing_authority: true,
			issuing_country: true,
			issuing_jurisdiction: true,
			issuance_date: true,
			expiry_date: true,
			birth_place: true,
			nationality: true,
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
			"description": "This is a PID document issued by the well known PID Issuer conforming to ARF 1.5 PID rulebook",
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
							"label": "First name",
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
							"label": "Last name",
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
							"label": "Date of birth",
							"description": "Full birth date (day, month, year)."
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
							"description": "Name of the issuing body or Member State (two-letter code)."
						}
					],
					"svg_id": "issuing_authority"
				},
				{
					"path": ["issuance_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Issue date",
							"description": "Start date of the document’s validity."
						}
					],
					"svg_id": "issuance_date"
				},
				{
					"path": ["expiry_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Expiry date",
							"description": "The date that the credential will expire"
						}
					],
					"svg_id": "expiry_date"
				},
				{
					"path": ["picture"],
					"svg_id": "picture"
				},
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