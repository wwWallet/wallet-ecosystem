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
				"path": ['$.credentialSubject.birthdate'],
				"filter": {}
			}
		]
	}
}

const verifiableIdDescriptorWithFirstnameLastname =	{
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
			},
			{
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionCountryCode'],
				"filter": {}
			}
		]
	}
}


const Pda1Descriptor = {
	"id": "Pda1",
	"constraints": {
		"fields": [
			{
				"path": ['$.type'],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'PDA1Credential' }
				}
			},
			{
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionCountryCode'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.employer.employmentType'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.employer.name'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.employer.employerId'],
				"filter": {}
			},
			{
				"path": ['$.credentialSubject.employer.typeOfId'],
				"filter": {}
			}
		]
	}
}




const verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition = {
	"id": "VerifiableIdWithEuropeanHealthInsuranceCard",
	"title": "PID and EHIC",
	"description": "Required Fields: PID (firstName, familyName), EHIC (ssn, validityPeriod, documentId, competentInstitution)",
	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
	"input_descriptors": [
		verifiableIdDescriptorWithFirstnameLastname,
		europeanHealthInsuranceCardDescriptor
	]
}

// const verifiableIdWithPda1WithEuropeanHealthInsuranceCardPresentationDefinition = {
// 	"id": "VerifiableIdWithBachelorWithEuropeanHealthInsuranceCard",
// 	"title": "PID, European Health Insurance Card and PDA1",
// 	"description": "Required Fields: PID (firstName, familyName), EHIC (ssn, validityPeriod, documentId, competentInstitution), PDA1 (ssn, validityPeriod, documentId, competentInstitution, employerInfo)",
// 	"format": { "vc+sd-jwt": { alg: [ 'ES256' ] },jwt_vc_json: { alg: [ 'ES256' ] }, jwt_vp: { alg: [ 'ES256' ] } },
// 	"input_descriptors": [
// 		verifiableIdDescriptorWithFirstnameLastname,
// 		europeanHealthInsuranceCardDescriptor,
// 		Pda1Descriptor,
// 	]
// }

const verifiableIdWithPda1PresentationDefinition = {
	"id": "VerifiableIdWithPda1",
	"title": "PID and PDA1",
	"description": "Required Fields: PID (firstName, familyName), PDA1 (ssn, validityPeriod, documentId, competentInstitution, employerInfo)",
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptorWithFirstnameLastname,
		Pda1Descriptor,
	]


}


const customVerifiableIdSdJwtPresentationDefinition = {
	"id": "CustomVerifiableId",
	"title": "Custom PID",
	"description": "Selectable Fields: personalIdentifier, firstName, familyName, birthdate",
	"selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
	]
}

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): PresentationDefinitionTypeWithFormat[] {
		return [
			customVerifiableIdSdJwtPresentationDefinition,
			verifiableIdWithEuropeanHealthInsuranceCardPresentationDefinition,
			verifiableIdWithPda1PresentationDefinition,
			// verifiableIdWithPda1WithEuropeanHealthInsuranceCardPresentationDefinition
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
