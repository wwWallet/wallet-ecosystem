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

const bachelorDescriptorSdJwt = {
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
			},
			{
				"path": [ "$.credentialSubject.id" ],
				"filter": {}
			},
			{
				"path": [ "$.credentialSubject.familyName" ],
				"filter": {}
			},
			{
				"path": [ "$.credentialSubject.firstName" ],
				"filter": {}
			},
			{
				"path": [ "$.credentialSubject.eqfLevel" ],
				"filter": {},
			},
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
	"title": "Send your Verifiable ID card and bachelor",
	"description": "Send your Verifiable ID and bachelor Bachelor",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor
	]
}

const verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithEuropeanHealthInsuranceCard",
	"title": "Send your Verifiable ID card and European Health Insurance Card",
	"description": "Send your Verifiable ID and bachelor Bachelor",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const bachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "BachelorWithEuropeanHealthInsuranceCard",
	"title": "Send your Bachelor Diploma and European Health Insurance Card",
	"description": "Send your Bachelor Diploma and European Health Insurance Card",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithBachelorWithEuropeanHealthInsuranceCard",
	"title": "Send your Verifiable ID card, Bachelor Diploma and European Health Insurance Card",
	"description": "Send your Verifiable ID card, Bachelor Diploma and European Health Insurance Card",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor,
	]
}

const minimalBachelorSdJwtPresentationDefinition = {
	"id": "MinimalBachelorSdJwtPresentationDefinition",
	"title": "Send your minimal Bachelor Diploma",
	"description": "Required fields: familyName, firstName, eqfLevel",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
	"input_descriptors": [
		bachelorDescriptorSdJwt
	]
}

// const projectManagerPresentationDefinition = {
// 	"id": "Multiple", // scope name
// 	"title": "Project Manager",
// 	"description": "Apply for Project Manager",
// 	"format": { jwt_vc: { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'EdDSA' ] }, jwt_vp: { alg: [ 'ES256' ] } },
// 	"input_descriptors": [
// 		{
// 			"id": "Open Badge",
// 			"constraints": {
// 				"fields": [
// 					{
// 						"path": [ '$.vc.type' ],
// 						"filter": {
// 							"type": 'array',
// 							"items": { type: 'string' },
// 							"contains": { const: 'OpenBadgeCredential' }
// 						}
// 					}
// 				]
// 			}
// 		},
// 		{
// 			"id": "Residence",
// 			"constraints": {
// 				"fields": [
// 					{
// 						"path": [ '$.vc.type' ],
// 						"filter": {
// 							"type": 'array',
// 							"items": { type: 'string' },
// 							"contains": { const: 'PermanentResidentCard' }
// 						}
// 					}
// 				]
// 			}
// 		},
// 		bachelorDescriptor
// 	]
// }


@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [
			minimalBachelorSdJwtPresentationDefinition,
			{
				"id": "VerifiableId",
				"title": "Send your Verifiable ID card",
				"description": "Send your Verifiable ID card ",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			{
				"id": "Bachelor",
				"title": "Software Engineer - Core",
				"description": "Send your Bachelor Diploma to apply for 'Software Engineer - Core'",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European HealthInsurance Card",
				"description": "Send your EHIC card",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			verifiableIdWithBachelorPresentationDefinition,
			verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			bachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
			verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
			{
				"title": "Minimal VID",
				"description": "Minimal VID",
				"id": "vid", // scope name
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
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
			// projectManagerPresentationDefinition
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


	