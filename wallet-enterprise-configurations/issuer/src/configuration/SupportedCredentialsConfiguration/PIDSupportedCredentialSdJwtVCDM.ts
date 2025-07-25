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
import { createSRI } from "../../lib/sriGenerator";
import { pidMetadata1_8 } from "./typeMetadata/pidMetadata";
import { pidSchema_1_8 } from "./schema/pidSchema";
import { convertSdjwtvcToOpenid4vciClaims } from "../../lib/convertSdjwtvcToOpenid4vciClaims";

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
		return "pid:sd_jwt_dc";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:eudi:pid:1:dc";
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.DC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PID", this.getId()];
	}

	getDisplay() {
		return {
			name: `PID ARF 1.8 (${this.getFormat()})`,
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
					{ name: "Last name", value: vid.family_name },
					{ name: "Birth last name", value: vid.family_name_birth },
					{ name: "First name", value: vid.given_name },
					{ name: "Birth first name", value: vid.given_name_birth },
					{ name: "Date of birth", value: formatDateDDMMYYYY(vid.birth_date) },
					{ name: "Country of birth", value: vid.birth_country },
					{ name: "Region of birth", value: vid.birth_region },
					{ name: "City of birth", value: vid.birth_city },
					{ name: "Nationality", value: vid.nationality },
					{ name: "Personal ID", value: vid.personal_administrative_number },
					{ name: "Sex", value: vid.sex },
					{ name: "Email", value: vid.email_address },
					{ name: "Mobile", value: vid.mobile_phone_number },
					{ name: "Residence address", value: vid.resident_address },
					{ name: "Age equal or over 14", value: vid.age_over_14 },
					{ name: "Age equal or over 16", value: vid.age_over_16 },
					{ name: "Age equal or over 18", value: vid.age_over_18 },
					{ name: "Age equal or over 21", value: vid.age_over_21 },
					{ name: "Age equal or over 65", value: vid.age_over_65 },
					{ name: "Age", value: vid.age_in_years },
					{ name: "Birth year", value: vid.age_birth_year },
					{ name: "Issuing authority", value: vid.issuing_authority },
					{ name: "Issuing country", value: vid.issuing_country },
					{ name: "Issuing region", value: vid.issuing_jurisdiction },
					{ name: "Document number", value: vid.document_number },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				const { credentialRendering } = await initializeCredentialEngine();
				const dataUri = await credentialRendering.renderSvgTemplate({
					json: {
						...vid,
						birthdate: vid.birth_date,
						date_of_expiry: undefined,
						date_of_issuance: undefined
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

		if (request.body?.credential_configuration_id != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
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
			personal_administrative_number: vidEntry.personal_administrative_number,
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
				postal_code: String(vidEntry.resident_postal_code),
				street_address: vidEntry.resident_street,
				house_number: vidEntry.resident_house_number
			},
			age_equal_or_over: {
				"14": String(vidEntry.age_over_14) == '1' ? true : false,
				"18": String(vidEntry.age_over_18) == '1' ? true : false,
				"21": String(vidEntry.age_over_21) == '1' ? true : false,
				"16": String(vidEntry.age_over_16) == '1' ? true : false,
				"65": String(vidEntry.age_over_65) == '1' ? true : false,
			},
			age_in_years: vidEntry.age_in_years,
			age_birth_year: vidEntry.age_birth_year,
			birthdate: new Date(vidEntry.birth_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			issuing_authority: vidEntry.issuing_authority,
			issuing_country: vidEntry.issuing_country,
			issuing_jurisdiction: vidEntry.issuing_jurisdiction,
			document_number: String(vidEntry.document_number),
			date_of_issuance: new Date().toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			date_of_expiry: new Date(vidEntry.expiry_date).toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			sex: vidEntry.sex,
			nationalities: vidEntry.nationality.split(','),
			email: vidEntry.email_address,
			phone_number: vidEntry.mobile_phone_number,
			picture: vidEntry.sex == '1' ? await urlToDataUrl(config.url + "/images/male_portrait.jpg") : await urlToDataUrl(config.url + "/images/female_portrait.jpg"),
			trust_anchor: config.url + "/trust_anchor",
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.metadata().vct,
			"vct#integrity": createSRI(this.metadata()),
			"jti": `urn:vid:${randomUUID()}`,
			...vid,
		};

		const disclosureFrame = {
			family_name: true,
			birth_family_name: true,
			given_name: true,
			birth_given_name: true,
			personal_administrative_number: true,
			place_of_birth: {
				country: true,
				region: true,
				locality: true
			},
			birthdate: true,
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
				"14": true,
				"18": true,
				"16": true,
				"65": true,
				"21": true,
			},
			age_in_years: true,
			age_birth_year: true,
			issuing_authority: false,
			issuing_country: false,
			issuing_jurisdiction: false,
			document_number: true,
			date_of_issuance: true,
			date_of_expiry: false,
			sex: true,
			nationalities: true,
			email: true,
			phone_number: true,
			picture: true,
			trust_anchor: false
		}
		const { credential } = await this.getCredentialSigner()
			.signSdJwtVc(payload, { typ: VerifiableCredentialFormat.DC_SDJWT, vctm: [base64url.encode(JSON.stringify(this.metadata()))] }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: credential
		};

		return response;
	}

	public metadata(): any {
		return pidMetadata1_8;
	}

	public schema(): any {
		return pidSchema_1_8;
	}

	exportCredentialSupportedObject(): any {
		return {
			scope: this.getScope(),
			vct: this.metadata().vct,
			display: [this.getDisplay()],
			format: this.getFormat(),
			cryptographic_binding_methods_supported: ["jwk"],
			credential_signing_alg_values_supported: ["ES256"],
			proof_types_supported: {
				jwt: {
					proof_signing_alg_values_supported: ["ES256"]
				},
				attestation: {
					proof_signing_alg_values_supported: ["ES256"],
					key_attestations_required: {},
				}
			},
			claims:convertSdjwtvcToOpenid4vciClaims(this.metadata().claims, this.schema())
		}
	}
}
