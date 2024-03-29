import config from "../../../config";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import axios from "axios";

export class PDA1SupportedCredentialSdJwt implements SupportedCredentialProtocol {


	constructor(private credentialIssuerConfig: CredentialIssuer) { }

	getCredentialIssuerConfig(): CredentialIssuer {
		return this.credentialIssuerConfig;
	}
	getId(): string {
		return "urn:credential:pda1"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PDA1Credential", this.getId()];
	}
	getDisplay(): Display {
		return {
			name: "PDA1 Credential",
			logo: { url: config.url + "/images/ehicCard.png" },
			background_color: "#4CC3DD"
		}
	}


	async getProfile(_userSession: AuthorizationServerState): Promise<CredentialView | null> {
		return null;
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession.issuer_state) {
			throw new Error("issuer_state was found")
		}

		console.log("issuer state = ", userSession.issuer_state);

		let resourcesVaultResponse;
		try {
			resourcesVaultResponse = await axios.post(config.resourcesVaultService.url + "/fetch", {
				issuer_state: userSession.issuer_state
			});
		}
		catch(err) {
			console.error(err);
			throw new Error("Failed to get resource vault response")
		}

		const { claims } = resourcesVaultResponse.data;
		console.log("Claims = ", claims)
		const pda1: CredentialSubject = {
			id: holderDID,
			...claims
		} as any;

		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:pda1:${randomUUID()}`,
			"name": "PDA1",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National PDA1 credential issuer",
			"credentialSubject": {
				...pda1,
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

