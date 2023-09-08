import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprint } from "./SupportedCredentialsConfiguration/EdiplomasBlueprint";


@injectable()
export class CredentialIssuersConfigurationService {


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const diplomaIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setWalletId("conformant")
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		diplomaIssuer.addSupportedCredential(new EdiplomasBlueprint(diplomaIssuer, "75"));

		return new CredentialIssuersRepository([
			diplomaIssuer
		]);
	}
}