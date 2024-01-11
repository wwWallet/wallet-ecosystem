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


const verifiableIdDescriptor =	{
	"id": "VerifiableId",
	"constraints": {
		"fields": [
			{
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			}
		]
	}
}

const bachelorDescriptor = {
	"id": "Bachelor",
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


const europeanHealthInsuranceCardDescriptor = {
	"id": "EuropeanHealthInsuranceCard",
	"constraints": {
		"fields": [
			{
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'EuropeanHealthInsuranceCard' }
				}
			}
		]
	}
}



const verifiableIdWithBachelorPresentationDefinition = {
	"id": "VerifiableIdWithBachelor",
	"title": "Send your verifiable id card and bachelor",
	"description": "Send your Verifiable id and bachelor Bachelor",
	"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor
	]
}

const verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithEuropeanHealthInsuranceCard",
	"title": "Send your verifiable id card and European Health Insurance Card",
	"description": "Send your Verifiable id and bachelor Bachelor",
	"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const bachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "BachelorWithEuropeanHealthInsuranceCard",
	"title": "Send your verifiable id card and European Health Insurance Card",
	"description": "Send your Verifiable id and bachelor Bachelor",
	"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdBachelorWithEuropeanHealthInsuranceCard",
	"title": "Send your verifiable id card and European Health Insurance Card",
	"description": "Send your Verifiable id and bachelor Bachelor",
	"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor,
	]
}

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [
			{
				"id": "VerifiableId",
				"title": "Send your verifiable id card",
				"description": "Send your Bachelor Diploma to apply for 'Software Engineer - Core'",
				"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			{
				"id": "Bachelor",
				"title": "Software Engineer - Core",
				"description": "Send your Bachelor Diploma to apply for 'Software Engineer - Core'",
				"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European HealthInsurance Card",
				"description": "Send your ehic card",
				"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			verifiableIdWithBachelorPresentationDefinition,
			verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			bachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
			verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
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
					bachelorDescriptor
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


	