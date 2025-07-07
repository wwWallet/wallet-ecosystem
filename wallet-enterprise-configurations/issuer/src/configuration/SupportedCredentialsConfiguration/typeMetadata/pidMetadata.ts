import { config } from "../../../../config";
import { createSRI } from "../../../lib/sriGenerator";
import { pidSchema_1_5, pidSchema_1_8 } from "../schema/pidSchema";

export const pidMetadata1_5 = {
	"vct": "urn:eu.europa.ec.eudi:pid:1",
	"name": "Example ARF 1.5 PID SD-JWT TYPE METADATA",
	"description": "Example PID SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US). Adheres to PID Rulebook ARF 1.5 (urn:eu.europa.ec.eudi:pid:1).",
	"$comment": "Implementation of this example type metadata may require Member State–specific clarifications to align with national policies governing the display of included claims.",
	"display": [
		{
			"lang": "en-US",
			"name": "ARF 1.5 PID SD-JWT VC",
			"description": "Person Identification Data (PID) SD-JWT VC. Adheres to PID Rulebook ARF 1.5 (urn:eu.europa.ec.eudi:pid:1).",
			"rendering": {
				"simple": {
					"logo": {
						"uri": config.url + "/images/logo.png",
						"uri#integrity": createSRI("./public/images/logo.png"),
						"alt_text": "PID Logo"
					},
					"background_color": "#4cc3dd",
					"text_color": "#FFFFFF"
				},
				"svg_templates": [
					{
						"uri": config.url + "/images/template-pid.svg",
						"uri#integrity": createSRI("./public/images/template-pid.svg"),
						"properties": {
							"orientation": "landscape",
							"color_scheme": "light",
							"contrast": "normal"
						}
					}
				],
			}
		}
	],
	"claims": [
		{
			"path": [
				"jti"
			],
			"sd": "never",
		},
		{
			"path": [
				"sub"
			],
			"sd": "never",
		},
		{
			"path": [
				"iat"
			],
			"sd": "never",
		},
		{
			"path": [
				"family_name"
			],
			"sd": "always",
			"svg_id": "family_name",
			"display": [
				{
					"lang": "en-US",
					"label": "Last name",
					"description": "Current last name(s) or surname(s)."
				}
			]
		},
		{
			"path": [
				"given_name"
			],
			"sd": "always",
			"svg_id": "given_name",
			"display": [
				{
					"lang": "en-US",
					"label": "First name",
					"description": "Current first name(s), including middle name(s) if applicable."
				}
			]
		},
		{
			"path": [
				"birth_date"
			],
			"sd": "always",
			"svg_id": "birth_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Date of birth",
					"description": "Full birth date (day, month, year)."
				}
			]
		},
		{
			"path": [
				"birth_place"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Place of birth",
					"description": "Country (two-letter code) and optional region or city where the person was born."
				}
			]
		},
		{
			"path": [
				"nationality",
				null
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Nationality",
					"description": "Country or countries of nationality."
				}
			]
		},
		{
			"path": [
				"personal_administrative_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Personal ID",
					"description": "Unique personal identifier assigned by the authority."
				}
			]
		},
		{
			"path": [
				"portrait"
			],
			"sd": "always",
			"svg_id": "picture"
		},
		{
			"path": [
				"family_name_birth"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth last name",
					"description": "Last name(s) or surname(s) at birth."
				}
			]
		},
		{
			"path": [
				"given_name_birth"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth first name",
					"description": "First name(s), including middle name(s), at birth."
				}
			]
		},
		{
			"path": [
				"sex"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Sex",
					"description": "Recorded sex or gender, using standard codes."
				}
			]
		},
		{
			"path": [
				"email_address"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Email",
					"description": "Person's email address."
				}
			]
		},
		{
			"path": [
				"mobile_phone_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Mobile",
					"description": "Person’s mobile phone number."
				}
			]
		},
		{
			"path": [
				"resident_address"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Full address",
					"description": "Full formatted address of residence."
				}
			]
		},
		{
			"path": [
				"resident_street"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence street",
					"description": "Street name of residence."
				}
			]
		},
		{
			"path": [
				"resident_house_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence number",
					"description": "Street number of residence."
				}
			]
		},
		{
			"path": [
				"resident_postal_code"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence ZIP",
					"description": "Postal or ZIP code of residence."
				}
			]
		},
		{
			"path": [
				"resident_city"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "City of residence",
					"description": "Municipality, city, town, or village of residence."
				}
			]
		},
		{
			"path": [
				"resident_state"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "State of residence",
					"description": "State, province, or regional division of residence."
				}
			]
		},
		{
			"path": [
				"resident_country"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Country of residence",
					"description": "Country where the person currently resides."
				}
			]
		},
		{
			"path": [
				"age_over_14"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age over 14",
					"description": "Indicates if the person is 14 years old or older."
				}
			]
		},
		{
			"path": [
				"age_over_16"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age over 16",
					"description": "Indicates if the person is 16 years old or older."
				}
			]
		},
		{
			"path": [
				"age_over_18"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age over 18",
					"description": "Indicates if the person is 18 years old or older."
				}
			]
		},
		{
			"path": [
				"age_over_21"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age over 21",
					"description": "Indicates if the person is 21 years old or older."
				}
			]
		},
		{
			"path": [
				"age_over_65"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age over 65",
					"description": "Indicates if the person is 65 years old or older."
				}
			]
		},
		{
			"path": [
				"age_in_years"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age",
					"description": "Person's age in completed years."
				}
			]
		},
		{
			"path": [
				"age_birth_year"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth year",
					"description": "Year in which the person was born."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing authority",
					"description": "Name of the issuing body or Member State (two-letter code)."
				}
			]
		},
		{
			"path": [
				"issuing_country"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing country",
					"description": "Member State where the document was issued."
				}
			]
		},
		{
			"path": [
				"expiry_date"
			],
			"sd": "never",
			"svg_id": "expiry_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Expiry date",
					"description": "End date of the document’s validity."
				}
			]
		},
		{
			"path": [
				"issuance_date"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issue date",
					"description": "Start date of the document’s validity."
				}
			]
		},
		{
			"path": [
				"document_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Document number",
					"description": "Unique identifier of the PID document."
				}
			]
		},
		{
			"path": [
				"issuing_jurisdiction"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing region",
					"description": "Regional or local subdivision that issued the document."
				}
			]
		},
		{
			"path": [
				"trust_anchor"
			],
			"sd": "never"
		}
	],
	"schema_uri": config.url + "/pid-1-5-schema",
	"schema_uri#integrity": createSRI(pidSchema_1_5)
};

export const pidMetadata1_8 = {
	"vct": "urn:eudi:pid:1",
	"name": "Example ARF 1.8 PID SD-JWT TYPE METADATA",
	"description": "Example PID SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US). Adheres to PID Rulebook ARF 1.8 (urn:eudi:pid:1) and later, as of the time of publication.",
	"$comment": "Implementation of this example type metadata may require Member State–specific clarifications to align with national policies governing the display of included claims.",
	"display": [
		{
			"lang": "en-US",
			"name": "PID",
			"rendering": {
				"simple": {
					"logo": {
						"uri": config.url + "/images/logo.png",
						"uri#integrity": createSRI("./public/images/logo.png"),
						"alt_text": "PID Logo"
					},
					"background_color": "#4cc3dd",
					"text_color": "#FFFFFF"
				},
				"svg_templates": [
					{
						"uri": config.url + "/images/template-pid.svg",
						"uri#integrity": createSRI("./public/images/template-pid.svg"),
						"properties": {
							"orientation": "landscape",
							"color_scheme": "light",
							"contrast": "normal"
						}
					}
				],
			}
		}
	],
	"claims": [
		{
			"path": [
				"jti"
			],
			"sd": "never",
		},
		{
			"path": [
				"sub"
			],
			"sd": "never",
		},
		{
			"path": [
				"iat"
			],
			"sd": "never",
		},
		{
			"path": [
				"family_name"
			],
			"sd": "always",
			"svg_id": "family_name",
			"display": [
				{
					"lang": "en-US",
					"label": "Last name",
					"description": "Current last name(s) or surname(s)."
				}
			]
		},
		{
			"path": [
				"given_name"
			],
			"sd": "always",
			"svg_id": "given_name",
			"display": [
				{
					"lang": "en-US",
					"label": "First name",
					"description": "Current first name(s), including middle name(s) if applicable."
				}
			]
		},
		{
			"path": [
				"birthdate"
			],
			"sd": "always",
			"svg_id": "birth_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Date of birth",
					"description": "Full birth date (day, month, year)."
				}
			]
		},
		{
			"path": [
				"place_of_birth"
			],
			"sd": "always",
		},
		{
			"path": [
				"place_of_birth",
				"locality"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "City of birth",
					"description": "Municipality, city, town, or village where the person was born."
				}
			]
		},
		{
			"path": [
				"place_of_birth",
				"region"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Region of birth",
					"description": "State, province, district, or local area where the person was born."
				}
			]
		},
		{
			"path": [
				"place_of_birth",
				"country"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Country of birth",
					"description": "Country where the person was born."
				}
			]
		},
		{
			"path": [
				"nationalities",
				null
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Nationality",
					"description": "Country or countries of nationality."
				}
			]
		},
		{
			"path": [
				"personal_administrative_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Personal ID",
					"description": "Unique personal identifier assigned by the authority."
				}
			]
		},
		{
			"path": [
				"picture"
			],
			"sd": "always",
			"svg_id": "picture"
		},
		{
			"path": [
				"birth_family_name"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth last name",
					"description": "Last name(s) or surname(s) at birth."
				}
			]
		},
		{
			"path": [
				"birth_given_name"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth first name",
					"description": "First name(s), including middle name(s), at birth."
				}
			]
		},
		{
			"path": [
				"sex"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Sex",
					"description": "Recorded sex or gender, using standard codes."
				}
			]
		},
		{
			"path": [
				"email"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Email",
					"description": "Person's email address."
				}
			]
		},
		{
			"path": [
				"phone_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Mobile",
					"description": "Person’s mobile phone number."
				}
			]
		},
		{
			"path": [
				"address"
			],
			"sd": "always",
		},
		{
			"path": [
				"address",
				"formatted"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Full address",
					"description": "Full formatted address of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"street_address"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence street",
					"description": "Street name of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"house_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence number",
					"description": "Street number of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"postal_code"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Residence ZIP",
					"description": "Postal or ZIP code of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"locality"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "City of residence",
					"description": "Municipality, city, town, or village of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"region"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "State of residence",
					"description": "State, province, or regional division of residence."
				}
			]
		},
		{
			"path": [
				"address",
				"country"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Country of residence",
					"description": "Country where the person currently resides."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over"
			],
			"sd": "always",
		},
		{
			"path": [
				"age_equal_or_over",
				"14"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age equal or over 14",
					"description": "Indicates if the person is 14 years old or older."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over",
				"16"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age equal or over 16",
					"description": "Indicates if the person is 16 years old or older."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over",
				"18"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age equal or over 18",
					"description": "Indicates if the person is 18 years old or older."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over",
				"21"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age equal or over 21",
					"description": "Indicates if the person is 21 years old or older."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over",
				"65"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age equal or over 65",
					"description": "Indicates if the person is 65 years old or older."
				}
			]
		},
		{
			"path": [
				"age_in_years"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Age",
					"description": "Person's age in completed years."
				}
			]
		},
		{
			"path": [
				"age_birth_year"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Birth year",
					"description": "Year in which the person was born."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing authority",
					"description": "Name of the issuing body or Member State (two-letter code)."
				}
			]
		},
		{
			"path": [
				"issuing_country"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing country",
					"description": "Member State where the document was issued."
				}
			]
		},
		{
			"path": [
				"date_of_expiry"
			],
			"sd": "never",
			"svg_id": "expiry_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Expiry date",
					"description": "End date of the document’s validity."
				}
			]
		},
		{
			"path": [
				"date_of_issuance"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Issue date",
					"description": "Start date of the document’s validity."
				}
			]
		},
		{
			"path": [
				"document_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Document number",
					"description": "Unique identifier of the PID document."
				}
			]
		},
		{
			"path": [
				"issuing_jurisdiction"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing region",
					"description": "Regional or local subdivision that issued the document."
				}
			]
		},
		{
			"path": [
				"trust_anchor"
			],
			"sd": "never"
		},
	],
	"schema_uri": config.url + "/pid-1-8-schema",
	"schema_uri#integrity": createSRI(pidSchema_1_8)
}
