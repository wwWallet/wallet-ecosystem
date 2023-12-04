import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import { InputDescriptorType } from "@wwwallet/ssi-sdk";

export type PresentationDefinitionTypeWithFormat = {
	id: string;
	format?: any;
	input_descriptors: InputDescriptorType[];
};

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {

	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
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


	