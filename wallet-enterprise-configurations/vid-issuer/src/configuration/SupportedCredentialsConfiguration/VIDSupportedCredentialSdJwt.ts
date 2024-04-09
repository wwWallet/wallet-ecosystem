import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import fs from 'fs';

export class VIDSupportedCredentialSdJwt implements SupportedCredentialProtocol {

	dataset: any;

  constructor(private credentialIssuerConfig: CredentialIssuer) {
		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any;
	}

  getCredentialIssuerConfig(): CredentialIssuer {
    return this.credentialIssuerConfig;
  }
  getId(): string {
    return "urn:credential:vid"
  }
  getFormat(): VerifiableCredentialFormat {
    return VerifiableCredentialFormat.VC_SD_JWT;
  }
  getTypes(): string[] {
    return ["VerifiableCredential", "VerifiableAttestation", "VerifiableId", this.getId()];
  }
  getDisplay(): Display {
		return {
			name: "Verifiable ID",
			logo: { url: config.url + "/images/vidCard.png" },
			background_color: "#4CC3DD"
		}
  }


  async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
    if (!userSession?.personalIdentifier) {
      return null;
    }

		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any;
		const vids = this.dataset.users.filter((user: any) => user.authentication.personalIdentifier == userSession.personalIdentifier);
		const credentialViews: CredentialView[] = vids
			.map((vid: any) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: vid.claims.familyName },
					{ name: "First Name", value: vid.claims.firstName },
					{ name: "Personal Identifier", value: vid.claims.personalIdentifier },
					{ name: "Date of Birth", value: vid.claims.birthdate },
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
  
  async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any;  }> {
		if (!userSession.personalIdentifier) {
			throw new Error("Cannot generate credential: Taxis id is missing");
		}
		
		this.dataset = JSON.parse(fs.readFileSync('/datasets/dataset.json', 'utf-8').toString()) as any;
		const vidClaims = this.dataset.users.filter((user: any) => user.authentication.personalIdentifier == userSession.personalIdentifier)[0].claims;
		console.log("Vid claims = ", vidClaims)
		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:vid:${randomUUID()}`,
			"name": "Verifiable ID",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National Verifiable ID credential issuer and it can be used for authentication purposes",
			"credentialSubject": {
				...vidClaims,
				"id": holderDID,
			},
			"credentialBranding": {
				"image": {
					"url": config.url + "/images/vidCard.png"
				},
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
			"credentialSchema": {
				"id": "https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/z8Y6JJnebU2UuQQNc2R8GYqkEiAMj3Hd861rQhsoNWxsM",
				"type": "JsonSchema",
			}
		};

		const disclosureFrame = {
			vc: {
				credentialSubject: {
					familyName: true,
					firstName: true,
					birthdate: true,
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
			display: [ this.getDisplay() ],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

