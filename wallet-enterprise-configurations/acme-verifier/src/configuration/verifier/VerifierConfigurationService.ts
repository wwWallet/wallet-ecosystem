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
					"const": "urn:eudi:pid:1"
				}
			},
			{
				"name": "Given Name",
				"path": ['$.given_name'],
				"filter": {}
			},
			{
				"name": "Given Name at Birth",
				"path": ['$.birth_given_name'],
				"filter": {}
			},
			{
				"name": "Family Name",
				"path": ['$.family_name'],
				"filter": {}
			},
			{
				"name": "Family Name at Birth",
				"path": ['$.birth_family_name'],
				"filter": {}
			},
			{
				"name": "Place of Birth (Country)",
				"path": ['$.place_of_birth.country'],
				"filter": {}
			},
			{
				"name": "Place of Birth (Region)",
				"path": ['$.place_of_birth.region'],
				"filter": {}
			},
			{
				"name": "Place of Birth (Locality)",
				"path": ['$.place_of_birth.locality'],
				"filter": {}
			},
			{
				"name": "Address (Formatted)",
				"path": ['$.address.formatted'],
				"filter": {}
			},
			{
				"name": "Age equal or over 16",
				"path": ['$.age_equal_or_over.16'],
				"filter": {}
			},
			{
				"name": "Age equal or over 18",
				"path": ['$.age_equal_or_over.18'],
				"filter": {}
			},
			{
				"name": "Age equal or over 65",
				"path": ['$.age_equal_or_over.65'],
				"filter": {}
			},
			{
				"name": "Age in Years",
				"path": ['$.age_in_years'],
				"filter": {}
			},
			{
				"name": "Birth Date",
				"path": ['$.birth_date'],
				"filter": {}
			},
			{
				"name": "Email address",
				"path": ['$.email'],
				"filter": {}
			},
			{
				"name": "Phone Number",
				"path": ['$.phone_number'],
				"filter": {}
			},
			{
				"name": "Issuing Authority",
				"path": ['$.issuing_authority'],
				"filter": {}
			},
			{
				"name": "Issuing Country",
				"path": ['$.issuing_country'],
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
		"name": "Family Name at Birth",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['family_name_birth']"
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
		"name": "Given Name at Birth",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['given_name_birth']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Birthdate",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['birth_date']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Age over 18",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['age_over_18']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Age over 21",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['age_over_21']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Age in years",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['age_in_years']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Birth Place",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['birth_place']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident Address",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_address']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident Country",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_country']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident State",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_state']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident City",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_city']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident Postal Code",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_postal_code']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident Street",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_street']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Resident House Number",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['resident_house_number']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Email Address",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['email_address']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Mobile Phone number",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['mobile_phone_number']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Issuing Authority",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['issuing_authority']"
		],
		"intent_to_retain": false
	},
	{
		"name": "Issuing Country",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['issuing_country']"
		],
		"intent_to_retain": false
	},
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
	"id": "CustomSdJwtPID",
	"title": "Custom SD-JWT PID",
	"description": "Selectable Fields: Given Name, Given Name at Birth, Family Name, Family Name at Birth, Place of Birth (Country), Place of Birth (Region), Place of Birth (Locality), Address (Formatted), Age equal or over 16, Age equal or over 18, Age equal or over 65, Birthdate, Age in Years, Birth Date, Issuing Authority, Issuing Country",
	"_selectable": true,
	"format": { "vc+sd-jwt": { alg: ['ES256'] } },
	"input_descriptors": [
		verifiableIdDescriptor
	]
}

const customPIDMdocPresentationDefinition = {
	"id": "CustomMdocPID",
	"title": "Custom mDoc PID",
	"description": "Selectable Fields: Family Name, Family Name at Birth, Given Name, Given Name at Birth, Birthdate, Age over 18, Age over 21, Age in years, Birth Place, Resident Address, Resident Country, Resident State, Resident City, Resident Postal Code, Resident Street, Resident House Number, Email Address, Mobile Phone number, Issuing Authority, Issuing Country",
	"_selectable": true,
	"format": {
		"mso_mdoc": {
			"sd-jwt_alg_values": ["ES256"],
			"kb-jwt_alg_values": ["ES256"]
		},
	},
	"input_descriptors": [
		mdocPidDescriptor
	]
}

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): any[] {
		return [
			customPIDSdJwtPresentationDefinition,
			customPIDMdocPresentationDefinition,
			{
				"id": "sdJwtPID",
				"title": "PID - SD-JWT",
				"description": "Required Fields: VC type, Given Name, Given Name at Birth, Family Name, Family Name at Birth, Place of Birth (Country), Place of Birth (Region), Place of Birth (Locality), Address (Formatted), Age equal or over 16, Age equal or over 18, Age equal or over 65, Age in Years, Birth Date, Issuing Authority, Issuing Country",
				"format": { "vc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					verifiableIdDescriptor
				]
			},
			{
				"id": "mDocPID",
				"title": "PID - MSO MDOC",
				"description": "Required Fields: Family Name, Family Name at Birth, Given Name, Given Name at Birth, Birthdate, Age over 18, Age over 21, Age in years, Birth Place, Resident Address, Resident Country, Resident State, Resident City, Resident Postal Code, Resident Street, Resident House Number, Email Address, Mobile Phone number, Issuing Authority, Issuing Country",
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
				"title": "PID (SD-JWT) + EHIC",
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


