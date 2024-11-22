import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";
import { PresentationParserChain } from "../../vp_token/PresentationParserChain";
import { PublicKeyResolverChain } from "../../vp_token/PublicKeyResolverChain";




const verifiableIdDescriptor = {
	"id": "VerifiableId",
	"constraints": {
		"fields": [
			{
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:credential:vid"
				}
			},
			{
				"name": "Given Name",
				"path": ['$.given_name'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.family_name'],
				"filter": {}
			},
			{
				"name": "Birthdate",
				"path": ['$.birth_date'],
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
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:credential:diploma"
				}
			},
			{
				"name": "Grade",
				"path": ['$.grade'],
				"filter": {}
			},
			{
				"name": "EQF Level",
				"path": ['$.eqf_level'],
				"filter": {}
			},
			{
				"name": "Diploma Title",
				"path": ['$.title'],
				"filter": {}
			},
		]
	}
}

const europeanHealthInsuranceCardDescriptor = {
	"id": "EuropeanHealthInsuranceCard",
	"constraints": {
		"fields": [
			{
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:credential:ehic"
				}
			},
			{
				"name": "SSN",
				"path": ['$.ssn'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.family_name'],
				"filter": {}
			},
			{
				"name": "Given Name",
				"path": ['$.given_name'],
				"filter": {}
			},
			{
				"name": "Birth Date",
				"path": ['$.birth_date'],
				"filter": {}
			},
		]
	}
}


const customVerifiableIdSdJwtPresentationDefinition = {
	"id": "CustomVerifiableId",
	"title": "Custom Verifiable ID",
	"description": "Selectable Fields: personalIdentifier, firstName, familyName, birthdate",
	"_selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
	]
}

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
			customVerifiableIdSdJwtPresentationDefinition,
			{
				"id": "VerifiableId",
				"title": "Verifiable ID",
				"description": "Required Fields: VC type, Given Name, Family Name & Birthdate",
				"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			{
				"id": "Bachelor",
				"title": "Bachelor Diploma",
				"description": "Required Fields: VC type, Grade, EQF Level & Diploma Title",
				"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European HealthInsurance Card",
				"description": "Required Fields: VC type, SSN, Family Name, Given Name & Birth Date",
				"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			{
				"id": "VIDAndEuropeanHealthInsuranceCard",
				"title": "VID + EHIC",
				"description": "",
				"format": { "vc+sd-jwt": { alg: ['ES256'] }, jwt_vc_json: { alg: ['ES256'] }, jwt_vp: { alg: ['ES256'] } },
				"input_descriptors": [
					verifiableIdDescriptor,
					europeanHealthInsuranceCardDescriptor
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


