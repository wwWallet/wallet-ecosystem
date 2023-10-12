import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import { InputDescriptorType } from "@wwWallet/ssi-sdk";

export type PresentationDefinitionTypeWithFormat = {
	id: string;
	format?: any;
	input_descriptors: InputDescriptorType[];
};

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {

	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [{
			"id": "vid", // scope name
			"format": { jwt_vc: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
			"input_descriptors": [
				{
					"id": "VID",
					"constraints": {
						"fields": [
							{
								"path": [
									"$.credentialSubject.personalIdentifier"
								],
								"filter": {}
							},
							{
								"path": [
									"$.credentialSchema.id"
								],
								"filter": {
									"type": "string",
									"const": "https://api-pilot.ebsi.eu/trusted-schemas-registry/v2/schemas/z8Y6JJnebU2UuQQNc2R8GYqkEiAMj3Hd861rQhsoNWxsM"
								}
							}
						]
					}
				}
			]
		},
		{
			id: 'ver_test:vp_token', // scope name
			format: { jwt_vc: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
			input_descriptors: [
				{
					id: '<any id, random or static>',
					constraints: {
						fields: [
							{
								path: [ '$.type' ],
								filter: {
									type: 'array',
									contains: { const: 'VerifiableAttestation' }
								}
							}
						]
					}
				},
				{
					id: '123456',
					constraints: {
						fields: [
							{
								path: [ '$.type' ],
								filter: {
									type: 'array',
									contains: { const: 'VerifiableAttestation' }
								}
							}
						]
					}
				},
				{
					id: '1234',
					constraints: {
						fields: [
							{
								path: [ '$.type' ],
								filter: {
									type: 'array',
									contains: { const: 'VerifiableAttestation' }
								}
							}
						]
					}
				}
			]
		}]
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


	