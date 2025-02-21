import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";
import { PresentationParserChain } from "../../vp_token/PresentationParserChain";
import { PublicKeyResolverChain } from "../../vp_token/PublicKeyResolverChain";


@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {
	getPublicKeyResolverChain(): PublicKeyResolverChain {
		return new PublicKeyResolverChain();
	}

	getPresentationParserChain(): PresentationParserChain {
		return new PresentationParserChain();
	}


	getPresentationDefinitions(): any[] {
		return [
			{
				"id": "vid",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
				"input_descriptors": [
					{
						"id": "VID",
						"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
						"constraints": {
							"fields": [
								{
									"name": "Document Number",
									"path": [
										"$.document_number"
									],
									"filter": {}
								},
								{
									"name": "Credential Type",
									"path": [
										"$.vct"
									],
									"filter": {
										"type": "string",
										"const": "urn:eu.europa.ec.eudi:pid:1"
									}
								}
							]
						}
					}
				]
			}
		]
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


	