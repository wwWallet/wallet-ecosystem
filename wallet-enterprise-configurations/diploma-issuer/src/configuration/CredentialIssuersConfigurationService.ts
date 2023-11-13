import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprint } from "./SupportedCredentialsConfiguration/EdiplomasBlueprint";
import { CredentialIssuersConfiguration } from "../services/interfaces";


@injectable()
export class CredentialIssuersConfigurationService implements CredentialIssuersConfiguration {

	readonly credentialIssuerIdentifierUOA = config.url + "/uoa";

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

	public registeredClients(): { client_id: string; friendlyName: string; redirectUri: string; }[] {
		const openidGenericClient = {
			client_id: "123",
			friendlyName: "Agnostic Client",
			redirectUri: "openid://cb"
		};

		const localWWWalletClient = {
			client_id: "343242",
			friendlyName: "Dev wwwWallet Client",
			redirectUri: "http://localhost:3000/cb"
		};

		const deployedWWWalletClient = {
			client_id: "1232132131232131",
			friendlyName: "wwwWallet",
			redirectUri: "https://demo.wwwallet.org/cb"
		};
		return [
			openidGenericClient,
			localWWWalletClient,
			deployedWWWalletClient
		]
	}

	public defaultCredentialIssuerIdentifier(): string {
		return this.credentialIssuerIdentifierUOA;
	}
}