import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";



@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {

	getPresentationDefinitions(): any[] {
		return []
	}

	getConfiguration(): OpenidForPresentationsConfiguration {
		return {
			baseUrl: config.url,
			client_id: authorizationServerMetadataConfiguration.authorization_endpoint,
			redirect_uri: config.url + "/verification/direct_post",
			authorizationServerWalletIdentifier: "authorization_server",
		}
	}

}
