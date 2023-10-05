import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprint } from "./SupportedCredentialsConfiguration/EdiplomasBlueprint";
import { CredentialIssuersConfiguration } from "../services/interfaces";


@injectable()
export class CredentialIssuersConfigurationService implements CredentialIssuersConfiguration {

	readonly credentialIssuerIdentifierUOA = config.url;

	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const diplomaIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(this.credentialIssuerIdentifierUOA)
			.setWalletId("conformant")
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(this.credentialIssuerIdentifierUOA + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// diplomaIssuer.addSupportedCredential(new EdiplomasBlueprint(diplomaIssuer, "75"));
		diplomaIssuer.addSupportedCredential(new EdiplomasBlueprint(diplomaIssuer, "46"));

		return new CredentialIssuersRepository([
			diplomaIssuer
		]);
	}

	public defaultCredentialIssuerIdentifier(): string {
		return this.credentialIssuerIdentifierUOA;
	}
}