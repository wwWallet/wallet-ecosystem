import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import config from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import { InputDescriptorType } from "@wwwallet/ssi-sdk";
import "reflect-metadata";

export type PresentationDefinitionTypeWithFormat = {
	title: string;
	description: string;
	id: string;
	format?: any;
	input_descriptors: InputDescriptorType[];
	selectable?: boolean;
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
			},
			{
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.personalIdentifier'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.dateOfBirth'],
				"filter": {}
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
			},
			{
				"path": ['$.credentialSubject.id'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.diplomaTitle'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.grade'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.eqfLevel'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.certificateId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.dateOfBirth'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.awardingDate'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.completionDate'],
				"filter": {}
			},
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
			},
			{
				"path": ['$.credentialSubject.id'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.personalIdentifier'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.dateOfBirth'],
				"filter": {}
			},
		]
	}
}



const verifiableIdWithBachelorPresentationDefinition = {
	"id": "VerifiableIdWithBachelor",
	"title": "Verifiable ID and Bachelor Diploma",
	"description": "Required Fields: Verifiable ID (type, personalIdentifier, firstName, familyName, dateOfBirth), Bachelor Diploma (id, firstName, familyName, diplomaTitle, grade, eqfLevel, certificateId, dateOfBirth, awardingDate, completionDate)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor
	]
}

const verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithEuropeanHealthInsuranceCard",
	"title": "Verifiable ID and European Health Insurance Card",
	"description": "Required Fields: Verifiable ID (type, personalIdentifier, firstName, familyName, dateOfBirth), EHIC (id, firstName, familyName, personalIdentifier, dateOfBirth)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const bachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "BachelorWithEuropeanHealthInsuranceCard",
	"title": "Bachelor Diploma and European Health Insurance Card",
	"description": "Required Fields: Bachelor Diploma (id, firstName, familyName, diplomaTitle, grade, eqfLevel, certificateId, dateOfBirth, awardingDate, completionDate), EHIC (id, firstName, familyName, personalIdentifier, dateOfBirth)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor
	]
}

const verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithBachelorWithEuropeanHealthInsuranceCard",
	"title": "Verifiable ID, Bachelor Diploma and European Health Insurance Card",
	"description": "Required Fields: Verifiable ID (type, personalIdentifier, firstName, familyName, dateOfBirth), Bachelor Diploma (id, firstName, familyName, diplomaTitle, grade, eqfLevel, certificateId, dateOfBirth, awardingDate, completionDate), EHIC (id, firstName, familyName, personalIdentifier, dateOfBirth)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptor,
		bachelorDescriptor,
		europeanHealthInsuranceCardDescriptor,
	]
}

const minimalBachelorSdJwtPresentationDefinition = {
	"id": "MinimalBachelorSdJwtPresentationDefinition",
	"title": "Minimal Bachelor Diploma",
	"description": "Required Fields: id, type, familyName, firstName, eqfLevel",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
	"input_descriptors": [
		bachelorDescriptorSdJwt
	]
}

const customVerifiableIdSdJwtPresentationDefinition = {
	"id": "CustomVerifiableId",
	"title": "Custom Verifiable ID",
	"description": "Selectable Fields: personalIdentifier, firstName, familyName, dateOfBirth",
	"selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
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
			customVerifiableIdSdJwtPresentationDefinition,
			{
				"title": "Minimal Verifiable ID",
				"description": "Required Fields: id, personalIdentifier",
				"id": "vid", // scope name
				"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
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
				"id": "VerifiableId",
				"title": "Verifiable ID",
				"description": "Required Fields: type, personalIdentifier, firstName, familyName, dateOfBirth",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			minimalBachelorSdJwtPresentationDefinition,
			{
				"id": "Bachelor",
				"title": "Bachelor Diploma",
				"description": "Required Fields: id, firstName, familyName, diplomaTitle, grade, eqfLevel, certificateId, dateOfBirth, awardingDate, completionDate",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European HealthInsurance Card",
				"description": "Required Fields: id, firstName, familyName, personalIdentifier, dateOfBirth",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			verifiableIdWithBachelorPresentationDefinition,
			verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			bachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
			verifiableIdWithBachelorWithEuropeanHealthInsuranceCardPresentationDefinition,
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


	