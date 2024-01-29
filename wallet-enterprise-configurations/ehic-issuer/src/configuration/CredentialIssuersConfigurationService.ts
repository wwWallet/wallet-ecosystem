import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { CredentialIssuersConfiguration } from "../services/interfaces";
import { EHICSupportedCredentialJwtVcJson } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialJwtVcJson";


@injectable()
export class CredentialIssuersConfigurationService implements CredentialIssuersConfiguration {


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const ehicIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setWalletId("conformant")
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// ehicIssuer.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(ehicIssuer));
		// ehicIssuer.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(ehicIssuer));
		// ehicIssuer.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(ehicIssuer));
		ehicIssuer.addSupportedCredential(new EHICSupportedCredentialJwtVcJson(ehicIssuer));

		// const ehicIssuer2 = new CredentialIssuer()
		// 	.setCredentialIssuerIdentifier(config.url + "/vid")
		// 	.setWalletId("conformant")
		// 	.setAuthorizationServerURL(config.url)
		// 	.setCredentialEndpoint(config.url + "/vid/openid4vci/credential")
		// 	// .setDeferredCredentialEndpoint(config.url + "/vid/openid4vci/deferred");
		// ehicIssuer2.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(ehicIssuer2));
		// ehicIssuer2.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(ehicIssuer2));
		// ehicIssuer2.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(ehicIssuer2));
	
		return new CredentialIssuersRepository([
			ehicIssuer,
			// ehicIssuer2
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
		return config.url;
	}
}