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
import { pidMetadata1_5 } from "./typeMetadata/pidMetadata";
import { pidSchema_1_5 } from "./schema/pidschema";

const datasetName = "vid-dataset.xlsx";
parsePidData(path.join(__dirname, `../../../../dataset/${datasetName}`)) // test parse

export class PIDSupportedCredentialSdJwtVCDM_1_5_VC implements VCDMSupportedCredentialProtocol {


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
		return "urn:eu.europa.ec.eudi:pid:1:vc";
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PID", this.getId()];
	}

	getDisplay() {
		return {
			name: `PID ARF 1.5 (${this.getFormat()})`,
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
					{ name: "Age over 14", value: vid.age_over_14 },
					{ name: "Age over 16", value: vid.age_over_16 },
					{ name: "Age over 18", value: vid.age_over_18 },
					{ name: "Age over 21", value: vid.age_over_21 },
					{ name: "Age over 65", value: vid.age_over_65 },
					{ name: "Age", value: vid.age_in_years },
					{ name: "Birth year", value: vid.age_birth_year },
					{ name: "Place of birth", value: vid.birth_place },
					{ name: "Nationality", value: vid.nationality },
					{ name: "Issuing authority", value: vid.issuing_authority },
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
			given_name: vidEntry.given_name,
			family_name_birth: vidEntry.family_name_birth,
			given_name_birth: vidEntry.given_name_birth,
			sex: vidEntry.sex,
			email_address: vidEntry.email_address,
			mobile_phone_number: vidEntry.mobile_phone_number,
			resident_address: vidEntry.resident_address,
			resident_street: vidEntry.resident_street,
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
			portrait: vidEntry.sex == '1' ? await urlToDataUrl(config.url + "/images/male_portrait.jpg") : await urlToDataUrl(config.url + "/images/female_portrait.jpg"),
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
			given_name: true,
			family_name_birth: true,
			given_name_birth: true,
			sex: true,
			email_address: true,
			mobile_phone_number: true,
			resident_address: true,
			resident_street: true,
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
			portrait: true
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
		return pidMetadata1_5;
	}

	public schema(): any {
		return pidSchema_1_5;
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
				}
			}
		}
	}
}