import { config } from "../../../../config";
import { createSRI } from "../../../lib/sriGenerator";
import { ehicSchema } from "./../schema/ehicSchema";

export const ehicMetadata = {
	"vct": "urn:eudi:ehic:1",
	"name": "EHIC SD-JWT TYPE METADATA",
	"description": "European Health Insurance Card (EHIC) SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US).",
	"$comment": "Implementation of this example Type Metadata may require Member State-specific clarifications to align with national policies governing the display of included claims.",
	"display": [
		{
			"lang": "en-US",
			"name": "EHIC SD-JWT VC",
			"description": "European Health Insurance Card (EHIC) SD-JWT VC",
			"rendering": {
				"simple": {
					"background_color": "#1b263b",
					"text_color": "#FFFFFF"
				},
				"svg_templates": [
					{
						"uri": config.url + "/images/template-ehic.svg",
						"uri#integrity": createSRI("./public/images/template-ehic.svg"),
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
				"personal_administrative_number"
			],
			"sd": "always",
			"svg_id": "personal_administrative_number",
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
				"issuing_country"
			],
			"sd": "never",
			"svg_id": "issuer_country",
			"display": [
				{
					"lang": "en-US",
					"label": "Issuing country",
					"description": "EHIC issuing country."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"sd": "never",
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
					"description": "EHIC issuing authority unique identifier."
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
					"description": "EHIC issuing authority name."
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
					"description": "EHIC expiration date."
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
					"description": "EHIC validity start date."
				}
			]
		},
		{
			"path": [
				"authentic_source"
			],
			"sd": "never",
		},
		{
			"path": [
				"authentic_source",
				"id"
			],
			"sd": "never",
			"svg_id": "authentic_source_id",
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
					"description": "End date of the insurance coverage."
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
					"description": "Start date of the insurance coverage."
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
					"description": "EHIC unique document identifier."
				}
			]
		}
	],
	"schema_uri": config.url + "/ehic-schema",
	"schema_uri#integrity": createSRI(ehicSchema)
}
