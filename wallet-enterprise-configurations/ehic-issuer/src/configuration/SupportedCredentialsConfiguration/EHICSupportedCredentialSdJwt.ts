import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import fs from 'fs';

export class EHICSupportedCredentialSdJwt implements SupportedCredentialProtocol {

	dataset: any;

	constructor(private credentialIssuerConfig: CredentialIssuer) {
		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any
	}

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
		if (!userSession?.personalIdentifier) {
			return null;
		}
		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any
		const ehics = this.dataset.users.filter((user: any) => user.authentication.personalIdentifier == userSession.personalIdentifier);
		const credentialViews: CredentialView[] = ehics
			.map((ehic: any) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: ehic.claims.familyName },
					{ name: "First Name", value: ehic.claims.firstName },
					{ name: "SSN", value: ehic.claims.socialSecurityIdentification.ssn },
					{ name: "Date of Birth", value: ehic.claims.birthdate },
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
		if (!userSession.personalIdentifier) {
			throw new Error("Cannot generate credential: personalIdentifier is missing");
		}
		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any
		const ehicClaims = this.dataset.users.filter((user: any) => user.authentication.personalIdentifier == userSession.personalIdentifier)[0].claims;

		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:ehic:${randomUUID()}`,
			"name": "EHIC ID Card",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National EHIC ID credential issuer and it can be used for authentication purposes",
			"credentialSubject": {
				...ehicClaims,
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
					familyName: true,
					firstName: true,
					birthdate: true,
					personalIdentifier: true,
					socialSecurityIdentification: {
						ssn: true
					},
					validityPeriod: {
						startingDate: true,
						endingDate: true
					},
					documentId: true,
					competentInstitution: {
						competentInstitutionId: true,
						competentInstitutionName: true,
						competentInstitutionCountryCode: true
					},
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

