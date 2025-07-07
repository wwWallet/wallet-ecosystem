import { config } from "../../../../config";
import { createSRI } from "../../../lib/sriGenerator";
import { pda1Schema } from "./../schema/pda1Schema";

export const pda1Metadata = {
	"vct": "urn:eudi:pda1:1",
	"name": "DC4EU PDA1 SD-JWT VCTM",
	"description": "DC4EU Portable Document A1 (PDA1) SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US).",
	"$comment": "Implementation of the DC4EU VCTM may require Member State-specific clarifications to align with national policies governing the display of included claims.",
	"display": [
		{
			"lang": "en-US",
			"name": "PDA1 SD-JWT VC",
			"description": "Portable Document A1 (PDA1) SD-JWT VC.",
			"rendering": {
				"svg_templates": [
					{
						"uri": config.url + "/images/template-pda1.svg",
						"uri#integrity": createSRI("./public/images/template-pda1.svg"),
						"properties": {
							"orientation": "landscape",
							"color_scheme": "light",
							"contrast": "normal"
						}
					}
				]
			}
		}
	],
	"claims": [
		{
			"path": [
				"personal_administrative_number"
			],
			"sd": "always",
			"display": [
				{
					"lang": "en-US",
					"label": "Social Security PIN",
					"description": "Unique personal identifier used by social security services."
				}
			]
		},
		{
			"path": [
				"employer"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Employer"
				}
			]
		},
		{
			"path": [
				"employer",
				"id"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Employer id",
					"description": "Employer unique identifier in EU or Member State registries."
				}
			]
		},
		{
			"path": [
				"employer",
				"name"
			],
			"sd": "never",
			"svg_id": "employer_name",
			"display": [
				{
					"lang": "en-US",
					"label": "Employer name",
					"description": "Employer name in EU or Member State registries."
				}
			]
		},
		{
			"path": [
				"employer",
				"country"
			],
			"sd": "never",
			"svg_id": "employer_country",
			"display": [
				{
					"lang": "en-US",
					"label": "Employer country",
					"description": "Country where the employer is registered."
				}
			]
		},
		{
			"path": [
				"work_address"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Work address"
				}
			]
		},
		{
			"path": [
				"work_address",
				"formatted"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Full workplace address",
					"description": "Full formatted address of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"street_address"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace street",
					"description": "Street name of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"building_number"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace building number",
					"description": "Street number or building of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"postal_code"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace ZIP",
					"description": "Postal or ZIP code of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"locality"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace city",
					"description": "Municipality, city, town, or village of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"region"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace state",
					"description": "State, province, or regional division of the workplace."
				}
			]
		},
		{
			"path": [
				"work_address",
				"country"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Workplace country",
					"description": "Country where the workplace is located."
				}
			]
		},
		{
			"path": [
				"legislation_country"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Applicable legislation",
					"description": "Country whose legislation is to be applied during the work abroad."
				}
			]
		},
		{
			"path": [
				"status_confirmation"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Status Confirmation",
					"description": "Status Confirmation, which defines the exact applicable legal framework for the worker."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing authority"
				}
			]
		},
		{
			"path": [
				"issuing_authority",
				"id"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing authority id",
					"description": "PDA1 issuing authority unique identifier."
				}
			]
		},
		{
			"path": [
				"issuing_authority",
				"name"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing authority name",
					"description": "PDA1 issuing authority name."
				}
			]
		},
		{
			"path": [
				"issuing_country"
			],
			"sd": "never",
			"svg_id": "issuing_country",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing country",
					"description": "PDA1 issuing country."
				}
			]
		},
		{
			"path": [
				"date_of_expiry"
			],
			"sd": "never",
			"svg_id": "date_of_expiry",
			"display": [
				{
					"lang": "en-US",
					"label": "Expiry date",
					"description": "PDA1 expiration date."
				}
			]
		},
		{
			"path": [
				"date_of_issuance"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Issue date",
					"description": "PDA1 validity start date."
				}
			]
		},
		{
			"path": [
				"authentic_source"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Competent institution"
				}
			]
		},
		{
			"path": [
				"authentic_source",
				"id"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Competent institution id",
					"description": "Identifier of the competent insitution as registered in the EESSI Institution Repository."
				}
			]
		},
		{
			"path": [
				"authentic_source",
				"name"
			],
			"sd": "never",
			"svg_id": "authentic_source_name",
			"display": [
				{
					"lang": "en-US",
					"label": "Competent institution name",
					"description": "Name of the competent insitution as registered in the EESSI Institution Repository."
				}
			]
		},
		{
			"path": [
				"ending_date"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Ending date",
					"description": "End date of the business decision validity period of the PDA1."
				}
			]
		},
		{
			"path": [
				"starting_date"
			],
			"sd": "never",
			"display": [
				{
					"lang": "en-US",
					"label": "Starting date",
					"description": "Start date of the business decision validity period of the PDA1."
				}
			]
		},
		{
			"path": [
				"document_number"
			],
			"sd": "always",
			"svg_id": "document_number",
			"display": [
				{
					"lang": "en-US",
					"label": "Document number",
					"description": "PDA1 unique document identifier."
				}
			]
		}
	],
	"schema_uri": config.url + "/pda1-schema",
	"schema_uri#integrity": createSRI(pda1Schema)
}
