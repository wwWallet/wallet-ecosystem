import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import { InputDescriptorType } from "@wwwallet/ssi-sdk";

export type PresentationDefinitionTypeWithFormat = {
	title: string;
	description: string;
	id: string;
	format?: any;
	input_descriptors: InputDescriptorType[];
};

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [
			{
				"id": "diploma", // scope name
				"title": "Software Engineer - Core",
				"description": "Send your Bachelor Diploma to apply for 'Software Engineer - Core'",
				"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'EdDSA' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					{
						"id": "University Diploma",
						"constraints": {
							"fields": [
								{
									"path": [ '$.type' ],
									"filter": {
										"type": 'array',
										"items": { type: 'string' },
										"contains": { const: 'Bachelor' }
									}
								}
							]
						}
					}
				]
			},
			{
				"id": "Multiple", // scope name
				"title": "Project Manager",
				"description": "Apply for Project Manager",
				"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'EdDSA' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					{
						"id": "Open Badge",
						"constraints": {
							"fields": [
								{
									"path": [ '$.vc.type' ],
									"filter": {
										"type": 'array',
										"items": { type: 'string' },
										"contains": { const: 'OpenBadgeCredential' }
									}
								}
							]
						}
					},
					{
						"id": "Residence",
						"constraints": {
							"fields": [
								{
									"path": [ '$.vc.type' ],
									"filter": {
										"type": 'array',
										"items": { type: 'string' },
										"contains": { const: 'PermanentResidentCard' }
									}
								}
							]
						}
					},
					{
						"id": "Bachelor",
						"constraints": {
							"fields": [
								{
									"path": [ '$.vc.type' ],
									"filter": {
										"type": 'array',
										"items": { type: 'string' },
										"contains": { const: 'Bachelor' }
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


	