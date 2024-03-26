import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { getEhic } from "../resources/data";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";

export class EHICSupportedCredentialSdJwt implements SupportedCredentialProtocol {


	constructor(private credentialIssuerConfig: CredentialIssuer) { }

	getCredentialIssuerConfig(): CredentialIssuer {
		return this.credentialIssuerConfig;
	}
	getId(): string {
		return "urn:credential:ehic"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "EuropeanHealthInsuranceCard", this.getId()];
	}
	getDisplay(): Display {
		return {
			name: "EHIC Card",
			logo: { url: config.url + "/images/ehicCard.png" },
			background_color: "#4CC3DD"
		}
	}


	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.ssn) {
			return null;
		}
		const ehics = [await getEhic(userSession?.ssn)];
		const credentialViews: CredentialView[] = ehics
			.map((ehic) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: ehic.familyName },
					{ name: "First Name", value: ehic.firstName },
					{ name: "Personal Identifier", value: ehic.personalIdentifier },
					{ name: "Date of Birth", value: ehic.birthdate },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				return {
					credential_id: this.getId(),
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					deferredFlow: false,
				}
			})
		return credentialViews[0];
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession.ssn) {
			throw new Error("Cannot generate credential: SSN is missing");
		}

		const ehicEntry = await getEhic(userSession?.ssn);

		if (!ehicEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}

		const ehic: CredentialSubject = {
			familyName: ehicEntry.familyName,
			firstName: ehicEntry.firstName,
			id: holderDID,
			personalIdentifier: ehicEntry.personalIdentifier,
			dateOfBirth: ehicEntry.birthdate
		} as any;

		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:ehic:${randomUUID()}`,
			"name": "EHIC ID Card",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National EHIC ID credential issuer and it can be used for authentication purposes",
			"credentialSubject": {
				...ehic,
				"id": holderDID,
			},
			"credentialBranding": {
				"image": {
					"url": config.url + "/images/ehicCard.png"
				},
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
		};

		const disclosureFrame = {
			vc: {
				credentialSubject: {
					dateOfBirth: true,
					personalIdentifier: true,
				}
			}
		}
		const { jws } = await this.getCredentialIssuerConfig().getCredentialSigner()
			.sign({
				vc: payload
			}, {}, disclosureFrame);
    const response = {
      format: this.getFormat(),
      credential: jws
    };

		return response;
	}

	exportCredentialSupportedObject(): CredentialSupportedJwtVcJson {
		return {
			id: this.getId(),
			format: this.getFormat(),
			display: [this.getDisplay()],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

