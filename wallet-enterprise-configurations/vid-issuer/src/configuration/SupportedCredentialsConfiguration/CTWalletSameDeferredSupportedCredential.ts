import config from "../../../config";
import { CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { SignVerifiableCredentialJWT } from "@wwwallet/ssi-sdk";
import { randomUUID } from 'node:crypto';
import { keystoreService } from "../../services/instances";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";


export class CTWalletSameDeferredSupportedCredential implements SupportedCredentialProtocol {

  constructor(private credentialIssuerConfig: CredentialIssuer) { }


  getCredentialIssuerConfig(): CredentialIssuer {
    return this.credentialIssuerConfig;
  }
  getId(): string {
    return "urn:credential:ct-wallet-deferred"
  }
  getFormat(): VerifiableCredentialFormat {
    return VerifiableCredentialFormat.JWT_VC_JSON;
  }
  getTypes(): string[] {
    return ["VerifiableCredential","VerifiableAttestation","CTWalletSameDeferred"];
  }
  getDisplay(): Display {
		return {
			name: "Verifiable ID",
			logo: { url: config.url + "/images/vidCard.png" },
			background_color: "#4CC3DD"
		}
  }


  async getProfile(_userSession: AuthorizationServerState): Promise<CredentialView | null> {

		const rows: CategorizedRawCredentialViewRow[] = [
			{ name: "Asynchronous", value: "Yes" },
		];
		const categorizedCredential: CredentialView = {
			view: { rows },
			credential_id: this.getId(),
			credential_supported_object: this.exportCredentialSupportedObject(),
			deferredFlow: true
		}
		return categorizedCredential;
  }
  
  async generateCredentialResponse(_userSession: AuthorizationServerState, holderDID: string): Promise<{ format?: VerifiableCredentialFormat; credential?: any; acceptance_token?: string }> {
    const nonSignedJwt = new SignVerifiableCredentialJWT()
      .setJti(`${this.getId()}:${randomUUID()}`)
			.setSubject(holderDID)
      .setIssuedAt()
      .setExpirationTime('1y')
      .setContext(["https://www.w3.org/2018/credentials/v1"])
      .setType(this.getTypes())
      .setCredentialSubject({ id: holderDID })
      // .setCredentialSchema("https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/z8Y6JJnebU2UuQQNc2R8GYqkEiAMj3Hd861rQhsoNWxsM");

		const { credential } = await keystoreService.signVcJwt(this.getCredentialIssuerConfig().walletId, nonSignedJwt);
    const response = {
      format: this.getFormat(),
      credential: credential
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

