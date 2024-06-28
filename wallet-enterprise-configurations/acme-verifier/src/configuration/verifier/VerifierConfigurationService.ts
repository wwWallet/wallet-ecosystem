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
	"id": "PID",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			},
			{
				"name": "First Name",
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"name": "Last Name",
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			},
			{
				"name": "Personal Identifier",
				"path": ['$.credentialSubject.personalIdentifier'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.credentialSubject.birthdate'],
				"filter": {}
			}
		]
	}
}

const verifiableIdDescriptorWithFirstnameLastname =	{
	"id": "PID",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'VerifiableId' }
				}
			},
			{
				"name": "First Name",
				"path": ['$.credentialSubject.firstName'],
				"filter": {}
			},
			{
				"name": "Last Name",
				"path": ['$.credentialSubject.familyName'],
				"filter": {}
			}
		]
	}
}



const europeanHealthInsuranceCardDescriptor = {
	"id": "EHIC",
	"constraints": {
		"fields": [
			{
				"name": "Credential Type",
				"path": [ '$.type' ],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'EuropeanHealthInsuranceCard' }
				}
			},
			{
				"name": "SSN",
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.credentialSubject.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.credentialSubject.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Id",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
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
				"name": "Credential Type",
				"path": ['$.type'],
				"filter": {
					"type": 'array',
					"items": { type: 'string' },
					"contains": { const: 'PDA1Credential' }
				}
			},
			{
				"name": "SSN",
				"path": ['$.credentialSubject.socialSecurityIdentification.ssn'],
				"filter": {}
			},
			{
				"name": "Starting Date",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.startingDate'],
				"filter": {}
			},
			{
				"name": "Ending Date",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.validityPeriod.endingDate'],
				"filter": {}
			},
			{
				"name": "Document Id",
				"path": ['$.credentialSubject.documentId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Id",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionId'],
				"filter": {}
			},
			{
				"name": "Competent Institution Name",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionName'],
				"filter": {}
			},
			{
				"name": "Competent Institution Country Code",
				"path": ['$.credentialSubject.competentInstitution.competentInstitutionCountryCode'],
				"filter": {}
			},
			{
				"name": "Name of Employer",
				"path": ['$.credentialSubject.employer.name'],
				"filter": {}
			},
			{
				"name": "Employer Id",
				"path": ['$.credentialSubject.employer.employerId'],
				"filter": {}
			},
			// {
			// 	"name": "Employer Country Code",
			// 	"path": ['$.credentialSubject.employer.countryCode'],
			// 	"filter": {}
			// },
			{
				"name": "Place of Work Town",
				"path": ['$.credentialSubject.placeOfWork.town'],
				"filter": {}
			},
			{
				"name": "Place of Work Postal Code",
				"path": ['$.credentialSubject.placeOfWork.postalCode'],
				"filter": {}
			},
			{
				"name": "Place of Work Country Code",
				"path": ['$.credentialSubject.placeOfWork.countryCode'],
				"filter": {}
			},
			{
				"name": "Member State Legislation",
				"path": ['$.credentialSubject.decisionOnApplicableLegislation.decisionOnMSWhoseLegislationApplies.memberStateWhoseLegislationIsToBeApplied'],
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
	"id": "PIDWithPda1",
	"title": "PID and PDA1",
	"description": "Required Fields: PID (firstName, familyName), PDA1 (ssn, validityPeriod, documentId, competentInstitution, employerInfo)",
	"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptorWithFirstnameLastname,
		Pda1Descriptor,
	]


}


const customVerifiableIdSdJwtPresentationDefinition = {
	"id": "CustomPID",
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
