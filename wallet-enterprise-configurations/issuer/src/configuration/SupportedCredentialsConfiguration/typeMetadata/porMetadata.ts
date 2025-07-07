import { createSRI } from "../../../lib/sriGenerator";
import { config } from "../../../../config";
import { porSchema } from "./../schema/porSchema";


export const porMetadata = {
	"vct": "urn:eu.europa.ec.eudi:por:1",
	"name": "POTENTIAL POR SD-JWT VCTM",
	"description": "POTENTIAL Power of Representation (POR) SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US).",
	"$comment": "Based on the Power Of Representation Rulebook v1.2 of the LSP POTENTIAL UC1.",
	"display": [
		{
			"lang": "en-US",
			"name": "POR SD-JWT VC",
			"description": "Power of Representation (POR) SD-JWT VC",
			"rendering": {
				"svg_templates": [
					{
						"uri": config.url + "/images/template-por.svg",
						"uri#integrity": createSRI("./public/images/template-por.svg"),
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
				"legal_person_identifier"
			],
			"sd": "never",
			"svg_id": "legal_person_identifier",
			"display": [
				{
					"lang": "en-US",
					"label": "Legal entity ID",
					"description": "Unique identifier of the legal entity being represented."
				}
			]
		},
		{
			"path": [
				"legal_name"
			],
			"sd": "never",
			"svg_id": "legal_name",
			"display": [
				{
					"lang": "en-US",
					"label": "Legal entity name",
					"description": "Name of the legal entity being represented."
				}
			]
		},
		{
			"path": [
				"full_powers"
			],
			"sd": "never",
			"svg_id": "full_powers",
			"display": [
				{
					"lang": "en-US",
					"label": "Full Representation Powers",
					"description": "Indicates whether the representative is fully authorized to act on behalf of the legal entity."
				}
			]
		},
		{
			"path": [
				"eService"
			],
			"sd": "never",
			"svg_id": "eService",
			"display": [
				{
					"lang": "en-US",
					"label": "Designated eService",
					"description": "Identifies the eServices in relation to which the natural person is empowered to represent the legal entity."
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
					"label": "Issuing authority",
					"description": "Legal name of the issuing entity."
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
					"description": "Country code where the document was issued."
				}
			]
		},
		{
			"path": [
				"effective_until_date"
			],
			"sd": "never",
			"svg_id": "effective_until_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Effective until",
					"description": "End date of valid representation (inclusive)."
				}
			]
		},
		{
			"path": [
				"effective_from_date"
			],
			"sd": "never",
			"svg_id": "effective_from_date",
			"display": [
				{
					"lang": "en-US",
					"label": "Effective from",
					"description": "Start date of valid representation (inclusive)."
				}
			]
		}
	],
	"schema_uri": config.url + "/por-schema",
	"schema_uri#integrity": createSRI(porSchema)
}