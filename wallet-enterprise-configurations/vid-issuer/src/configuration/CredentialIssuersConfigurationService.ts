import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { VIDSupportedCredential } from "./SupportedCredentialsConfiguration/VIDSupportedCredential";


@injectable()
export class CredentialIssuersConfigurationService {


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const vidIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setWalletId("conformant")
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// vidIssuer.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(vidIssuer));
		// vidIssuer.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(vidIssuer));
		// vidIssuer.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(vidIssuer));
		vidIssuer.addSupportedCredential(new VIDSupportedCredential(vidIssuer));

		// const vidIssuer2 = new CredentialIssuer()
		// 	.setCredentialIssuerIdentifier(config.url + "/vid")
		// 	.setWalletId("conformant")
		// 	.setAuthorizationServerURL(config.url)
		// 	.setCredentialEndpoint(config.url + "/vid/openid4vci/credential")
		// 	// .setDeferredCredentialEndpoint(config.url + "/vid/openid4vci/deferred");
		// vidIssuer2.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(vidIssuer2));
		// vidIssuer2.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(vidIssuer2));
		// vidIssuer2.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(vidIssuer2));
	
		return new CredentialIssuersRepository([
			vidIssuer,
			// vidIssuer2
		]);
	}
}