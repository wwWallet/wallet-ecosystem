import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";


const sdJwtPidFields = [
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
		"name": "First name",
		"path": ['$.given_name'],
		"filter": {}
	},
	{
		"name": "Birth first name",
		"path": ['$.birth_given_name'],
		"filter": {}
	},
	{
		"name": "Last name",
		"path": ['$.family_name'],
		"filter": {}
	},
	{
		"name": "Birth last name",
		"path": ['$.birth_family_name'],
		"filter": {}
	},
	{
		"name": "Date of birth",
		"path": ['$.birthdate'],
		"filter": {}
	},
	{
		"name": "Country of birth",
		"path": ['$.place_of_birth.country'],
		"filter": {}
	},
	{
		"name": "Region of birth",
		"path": ['$.place_of_birth.region'],
		"filter": {}
	},
	{
		"name": "City of birth",
		"path": ['$.place_of_birth.locality'],
		"filter": {}
	},
	{
		"name": "Nationality",
		"path": ['$.nationalities'],
		"filter": {}
	},
	{
		"name": "Personal ID",
		"path": ['$.personal_administrative_number'],
		"filter": {}
	},
	{
		"name": "Sex",
		"path": ['$.sex'],
		"filter": {}
	},
	{
		"name": "Residence address",
		"path": ['$.address.formatted'],
		"filter": {}
	},
	{
		"name": "Residence street",
		"path": ['$.address.street_address'],
		"filter": {}
	},
	{
		"name": "Residence number",
		"path": ['$.address.house_number'],
		"filter": {}
	},
	{
		"name": "Residence ZIP",
		"path": ['$.address.postal_code'],
		"filter": {}
	},
	{
		"name": "City of residence",
		"path": ['$.address.locality'],
		"filter": {}
	},
	{
		"name": "State of residence",
		"path": ['$.address.region'],
		"filter": {}
	},
	{
		"name": "Country of residence",
		"path": ['$.address.country'],
		"filter": {}
	},
	{
		"name": "Age equal or over 14",
		"path": ['$.age_equal_or_over.14'],
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
		"name": "Age equal or over 21",
		"path": ['$.age_equal_or_over.21'],
		"filter": {}
	},
	{
		"name": "Age",
		"path": ['$.age_in_years'],
		"filter": {}
	},
	{
		"name": "Birth year",
		"path": ['$.age_birth_year'],
		"filter": {}
	},
	{
		"name": "Email",
		"path": ['$.email'],
		"filter": {}
	},
	{
		"name": "Mobile",
		"path": ['$.phone_number'],
		"filter": {}
	},
	{
		"name": "Issuing authority",
		"path": ['$.issuing_authority'],
		"filter": {}
	},
	{
		"name": "Issuing country",
		"path": ['$.issuing_country'],
		"filter": {}
	},
	{
		"name": "Issuing region",
		"path": ['$.issuing_jurisdiction'],
		"filter": {}
	},
	{
		"name": "Expiry date",
		"path": ['$.date_of_expiry'],
		"filter": {}
	},
	{
		"name": "Issue date",
		"path": ['$.date_of_issuance'],
		"filter": {}
	},
	{
		"name": "Document number",
		"path": ['$.document_number'],
		"filter": {}
	},
	{
		"name": "Picture",
		"path": ['$.picture'],
		"filter": {}
	}
]

const sdJwtPidFields_1_5 = [
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
		"name": "First name",
		"path": ['$.given_name'],
		"filter": {}
	},
	{
		"name": "Birth first name",
		"path": ['$.given_name_birth'],
		"filter": {}
	},
	{
		"name": "Last name",
		"path": ['$.family_name'],
		"filter": {}
	},
	{
		"name": "Birth last name",
		"path": ['$.family_name_birth'],
		"filter": {}
	},
	{
		"name": "Sex",
		"path": ['$.sex'],
		"filter": {}
	},
	{
		"name": "Email",
		"path": ['$.email_address'],
		"filter": {}
	},
	{
		"name": "Mobile",
		"path": ['$.mobile_phone_number'],
		"filter": {}
	},
	{
		"name": "Full address",
		"path": ['$.resident_address'],
		"filter": {}
	},
	{
		"name": "Resident street",
		"path": ['$.resident_street'],
		"filter": {}
	},
	{
		"name": "Resident number",
		"path": ['$.resident_house_number'],
		"filter": {}
	},
	{
		"name": "Resident ZIP",
		"path": ['$.resident_postal_code'],
		"filter": {}
	},
	{
		"name": "City of residence",
		"path": ['$.resident_city'],
		"filter": {}
	},
	{
		"name": "State of residence",
		"path": ['$.resident_state'],
		"filter": {}
	},
	{
		"name": "Country of residence",
		"path": ['$.resident_country'],
		"filter": {}
	},
	{
		"name": "Personal ID",
		"path": ['$.personal_administrative_number'],
		"filter": {}
	},
	{
		"name": "Nationality",
		"path": ['$.nationality'],
		"filter": {}
	},
	{
		"name": "Place of birth",
		"path": ['$.birth_place'],
		"filter": {}
	},
	{
		"name": "Date of Βirth",
		"path": ['$.birth_date'],
		"filter": {}
	},
	{
		"name": "Age over 14",
		"path": ['$.age_over_14'],
		"filter": {}
	},
	{
		"name": "Age over 16",
		"path": ['$.age_over_16'],
		"filter": {}
	},
	{
		"name": "Age over 18",
		"path": ['$.age_over_18'],
		"filter": {}
	},
	{
		"name": "Age over 21",
		"path": ['$.age_over_21'],
		"filter": {}
	},
	{
		"name": "Age",
		"path": ['$.age_in_years'],
		"filter": {}
	},
	{
		"name": "Birth year",
		"path": ['$.age_birth_year'],
		"filter": {}
	},
	{
		"name": "Document number",
		"path": ['$.document_number'],
		"filter": {}
	},
	{
		"name": "Issuing authority",
		"path": ['$.issuing_authority'],
		"filter": {}
	},
	{
		"name": "Issuing country",
		"path": ['$.issuing_country'],
		"filter": {}
	},
	{
		"name": "Issuing region",
		"path": ['$.issuing_jurisdiction'],
		"filter": {}
	},
	{
		"name": "Issue date",
		"path": ['$.issuance_date'],
		"filter": {}
	},
	{
		"name": "Expiry date",
		"path": ['$.expiry_date'],
		"filter": {}
	},
	{
		"name": "Portrait",
		"path": ['$.portrait'],
		"filter": {}
	}
]

const sdJwtPidDescriptor_1_5 = {
	"id": "CustomVerifiableId1_5",
	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
	"constraints": {
		"fields": sdJwtPidFields_1_5
	}
}

const minimalSdJwtPidFields = [
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
		"name": "First name",
		"path": ['$.given_name'],
		"filter": {}
	},
	{
		"name": "Last name",
		"path": ['$.family_name'],
		"filter": {}
	},
	{
		"name": "Date of birth",
		"path": ['$.birthdate'],
		"filter": {}
	},
	{
		"name": "Nationality",
		"path": ['$.nationalities'],
		"filter": {}
	},
	{
		"name": "Expiry date",
		"path": ['$.date_of_expiry'],
		"filter": {}
	},
	{
		"name": "Issuing authority",
		"path": ['$.issuing_authority'],
		"filter": {}
	},
	{
		"name": "Issuing country",
		"path": ['$.issuing_country'],
		"filter": {}
	}
]


const minimalVerifiableIdSdJwtDescriptor = {
	"id": "minimalSdJwtPID",
	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
	"constraints": {
		"fields": minimalSdJwtPidFields
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
		"name": "Personal Administrative Number",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['personal_administrative_number']"
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
	{
		"name": "Issuing Jurisdiction",
		"path": [
			"$['eu.europa.ec.eudi.pid.1']['issuing_jurisdiction']"
		],
		"intent_to_retain": false
	},
]

const bachelorDescriptor = {
	"id": "Bachelor",
	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
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
	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
	"constraints": {
		"fields": [
			{
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:eudi:ehic:1"
				}
			},
			{
				"name": "Social Security PIN",
				"path": ['$.personal_administrative_number'],
				"filter": {}
			},
			{
				"name": "Document number",
				"path": ['$.document_number'],
				"filter": {}
			},
			{
				"name": "Issuing country",
				"path": ['$.issuing_country'],
				"filter": {}
			},
			{
				"name": "Issuing authority id",
				"path": ['$.issuing_authority.id'],
				"filter": {}
			},
			{
				"name": "Issuing authority name",
				"path": ['$.issuing_authority.name'],
				"filter": {}
			},
			{
				"name": "Competent institution id",
				"path": ['$.authentic_source.id'],
				"filter": {}
			},
			{
				"name": "Competent institution name",
				"path": ['$.authentic_source.name'],
				"filter": {}
			},
			{
				"name": "Starting date",
				"path": ['$.starting_date'],
				"filter": {}
			},
			{
				"name": "Ending date",
				"path": ['$.ending_date'],
				"filter": {}
			},
			{
				"name": "Expiry date",
				"path": ['$.date_of_expiry'],
				"filter": {}
			},
			{
				"name": "Issue date",
				"path": ['$.date_of_issuance'],
				"filter": {}
			}
		]
	}
}

const powerOfRepresentationDescriptor = {
	"id": "POR",
	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
	"constraints": {
		"fields": [
			{
				"name": "VC type",
				"path": [
					"$.vct"
				],
				"filter": {
					"type": "string",
					"const": "urn:eu.europa.ec.eudi:por:1"
				}
			},
			{
				"name": "Legal entity ID",
				"path": ['$.legal_person_identifier'],
				"filter": {}
			},
			{
				"name": "Legal entity name",
				"path": ['$.legal_name'],
				"filter": {}
			},
			{
				"name": "Full Representation Powers",
				"path": ['$.full_powers'],
				"filter": {}
			},
			{
				"name": "Designated eService",
				"path": ['$.eService'],
				"filter": {}
			},
			{
				"name": "Effective from",
				"path": ['$.effective_from_date'],
				"filter": {}
			},
			{
				"name": "Effective until",
				"path": ['$.effective_until_date'],
				"filter": {}
			}
		]
	}
}

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): any[] {
		return [
			{
				"id": "CustomVerifiableId",
				"title": "PID ARF v1.8",
				"description": "Select the format and the fields you want to request",
				_selectable: true,
				"input_descriptors": [
					{
						"id": undefined,
						"name": "Custom PID",
						"purpose": "Present your custom PID",
						"format": undefined,
						"constraints": {
							"limit_disclosure": "required",
							"fields": [
								...sdJwtPidFields,
								...mdocPidFields
							]
						}
					}
				]
			},
			{
				"id": "CustomVerifiableIdARF1_5",
				"title": "PID ARF v1.5",
				"description": "Select the fields you want to request",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				_selectable: true,
				"input_descriptors": [
					sdJwtPidDescriptor_1_5
				]
			},
			{
				"id": "Bachelor",
				"title": "Bachelor Diploma",
				"description": "Select the fields you want to request",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				_selectable: true,
				"input_descriptors": [
					bachelorDescriptor
				]
			},
			{
				"id": "EuropeanHealthInsuranceCard",
				"title": "European Health Insurance Card",
				"description": "Select the fields you want to request",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				_selectable: true,
				"input_descriptors": [
					europeanHealthInsuranceCardDescriptor
				]
			},
			{
				"id": "MinimalPIDAndEuropeanHealthInsuranceCard",
				"title": "PID (ARF v1.8) + EHIC",
				"description": "Request a PID (ARF v1.8) along with an EHIC",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					minimalVerifiableIdSdJwtDescriptor,
					europeanHealthInsuranceCardDescriptor
				]
			},
			{
				"id": "MinimalPIDAndPowerOfRepresentation",
				"title": "PID (ARF v1.8) + POR",
				"description": "Request a PID (ARF v1.8) along with a POR",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					minimalVerifiableIdSdJwtDescriptor,
					powerOfRepresentationDescriptor
				]
			},
			{
				"id": "MinimalPIDAndBachelorDiploma",
				"title": "PID (ARF v1.8) + Diploma",
				"description": "Request a PID (ARF v1.8) along with a Bachelor Diploma",
				"format": { "dc+sd-jwt": { alg: ['ES256'] } },
				"input_descriptors": [
					minimalVerifiableIdSdJwtDescriptor,
					bachelorDescriptor
				]
			},
			// { // example with Transaction Data
			// 	"id": "MinimalPIDwithTransactionData",
			// 	"title": "MinimalPID with Example Transaction Data",
			// 	"description": "PID fields: Given Name, Family Name, Birth Date, Nationality, Exp. Date, Issuing Authority, Issuing Country. Transaction Data Type: 'urn:wwwallet:example_transaction_data_type'",
			// 	"format": { "dc+sd-jwt": { alg: ['ES256'] } },
			// 	"input_descriptors": [
			// 		{ ...minimalVerifiableIdSdJwtDescriptor, _transaction_data_type: "urn:wwwallet:example_transaction_data_type" },
			// 	]
			// }
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


