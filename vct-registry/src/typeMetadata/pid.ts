import { config } from "../../config";
// import { createSRI } from "@src/sriGenerator";

export const pidMetadata = {
	"vct": "urn:eudi:pid:1",
	"name": "Example ARF 1.8 PID SD-JWT TYPE METADATA",
	"description": "Example PID SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US). Adheres to PID Rulebook ARF 1.8 (urn:eudi:pid:1) and later, as of the time of publication.",
	"$comment": "Implementation of this example type metadata may require Member State–specific clarifications to align with national policies governing the display of included claims.",
	"display": [
		{
			"locale": "en-US",
			"name": "PID",
			"rendering": {
				"simple": {
					"logo": {
						"uri": config.url + "/images/logo.png",
						// "uri#integrity": createSRI("./public/images/logo.png"),
						"alt_text": "PID Logo"
					},
					"background_color": "#4cc3dd",
					"text_color": "#FFFFFF"
				},
				"svg_templates": [
					{
						"uri": config.url + "/images/template-pid.svg",
						// "uri#integrity": createSRI("./public/images/template-pid.svg"),
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
				"vct"
			],
			"mandatory": true,
			"sd": "never",
		},
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
			"mandatory": true,
			"sd": "never",
		},
		{
			"path": [
				"iat"
			],
			"mandatory": true,
			"sd": "never",
		},
		{
			"path": [
				"cnh"
			],
			"mandatory": true,
			"sd": "never",
		},
		{
			"path": [
				"family_name"
			],
			"mandatory": true,
			"sd": "always",
			"svg_id": "family_name",
			"display": [
				{
					"locale": "en-US",
					"label": "Last name",
					"description": "Current last name(s) or surname(s)."
				}
			]
		},
		{
			"path": [
				"given_name"
			],
			"mandatory": true,
			"sd": "always",
			"svg_id": "given_name",
			"display": [
				{
					"locale": "en-US",
					"label": "First name",
					"description": "Current first name(s), including middle name(s) if applicable."
				}
			]
		},
		{
			"path": [
				"birthdate"
			],
			"mandatory": true,
			"sd": "always",
			"svg_id": "birth_date",
			"display": [
				{
					"locale": "en-US",
					"label": "Date of birth",
					"description": "Full birth date (day, month, year)."
				}
			]
		},
		{
			"path": [
				"place_of_birth"
			],
			"mandatory": true,
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
					"label": "Place of birth",
					"description": "Place where the person was born."
				}
			]
		},
		{
			"path": [
				"place_of_birth",
				"locality"
			],
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
					"label": "Nationality",
					"description": "Country of nationality."
				}
			]
		},
		{
			"path": [
				"nationalities"
			],
			"mandatory": true,
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
					"label": "Nationalities",
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
					"locale": "en-US",
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
			"svg_id": "picture",
			"display": [
				{
					"locale": "en-US",
					"label": "Picture"
				}
			]
		},
		{
			"path": [
				"birth_family_name"
			],
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
			"display": [
				{
					"locale": "en-US",
					"label": "Address",
					"description": "Person's residential address."
				}
			]
		},
		{
			"path": [
				"address",
				"formatted"
			],
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
			"display": [
				{
					"locale": "en-US",
					"label": "Age equal or over",
					"description": "Age threshold indicators."
				}
			]
		},
		{
			"path": [
				"age_equal_or_over",
				"14"
			],
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
					"label": "Birth year",
					"description": "Year in which the person was born."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"mandatory": true,
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
					"label": "Issuing authority",
					"description": "Name of the issuing body or Member State (two-letter code)."
				}
			]
		},
		{
			"path": [
				"issuing_country"
			],
			"mandatory": true,
			"sd": "always",
			"display": [
				{
					"locale": "en-US",
					"label": "Issuing country",
					"description": "Member State where the document was issued."
				}
			]
		},
		{
			"path": [
				"date_of_expiry"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "expiry_date",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
					"locale": "en-US",
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
	]
}
