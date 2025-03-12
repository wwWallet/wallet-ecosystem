import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";


const verifiableIdDescriptor = {
	"id": "PID",
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
	"constraints": {
		"fields": [
			{
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:eu.europa.ec.eudi:pid:1"
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

const mdocPidFields = [
	{
		"name": "Family Name",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['family_name']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Given Name",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['given_name']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Birthdate",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['birth_date']"
		],
		"intent_to_retain": false
	}
]

const mdocPidDescriptor = {
	"id": "eu.europa.ec.eudi.pid.1",
	"name": "MdocPID",
	"purpose": "Present your MDOC PID to the ACME verifier",
	"format": {
		"mso_mdoc": {
			"sd-jwt_alg_values": ["ES256"],
			"kb-jwt_alg_values": ["ES256"]
		},
	},
	"constraints": {
		"limit_disclosure": "required",
		"fields": mdocPidFields
	}
}

const bachelorDescriptor = {
	"id": "Bachelor",
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
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
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
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


const customPIDSdJwtPresentationDefinition = {
	"id": "CustomPID",
	"title": "Custom PID",
	"description": "Selectable Fields: personalIdentifier, firstName, familyName, birthdate",
	"_selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
	]
}

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): any[] {
		return [
			customPIDSdJwtPresentationDefinition,
			{
				"id": "PID",
				"title": "PID",
				"description": "Required Fields: VC type, Given Name, Family Name & Birthdate",
				"format": { "vc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			{
				"id": "mDocPID",
				"title": "PID - MSO MDOC",
				"description": "Required Fields: Given Name, Family Name & Birthdate",
				"format": { "mso_mdoc": { alg: ['ES256'] } },
				"input_descriptors": [
					mdocPidDescriptor
				]
			},
			{
				"id": "Bachelor",
				"title": "Bachelor Diploma",
				"description": "Required Fields: VC type, Grade, EQF Level & Diploma Title",
				"format": { "vc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European HealthInsurance Card",
				"description": "Required Fields: VC type, SSN, Family Name, Given Name & Birth Date",
				"format": { "vc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			{
				"id": "PIDAndEuropeanHealthInsuranceCard",
				"title": "PID + EHIC",
				"description": "",
				"format": { "vc+sd-jwt": { alg: ['ES256'] } },
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


