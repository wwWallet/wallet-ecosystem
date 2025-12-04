import { config } from "../../config";
// import { createSRI } from "../sriGenerator";

export const porMetadata = {
	"vct": "urn:eu.europa.ec.eudi:por:1",
	"name": "POTENTIAL POR SD-JWT VCTM",
	"description": "POTENTIAL Power of Representation (POR) SD-JWT Verifiable Credential Type Metadata, based on ietf-oauth-sd-jwt-vc (draft 09), using a single language tag (en-US).",
	"$comment": "Based on the Power Of Representation Rulebook v1.2 of the LSP POTENTIAL UC1.",
	"display": [
		{
			"locale": "en-US",
			"name": "POR SD-JWT VC",
			"description": "Power of Representation (POR) SD-JWT VC",
			"rendering": {
				"svg_templates": [
					{
						"uri": config.url + "/images/template-por.svg",
						// "uri#integrity": createSRI("./public/images/template-por.svg"),
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
				"vct"
			],
			"mandatory": true,
			"sd": "never",
		},
		{
			"path": [
				"iss"
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
				"legal_person_identifier"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "legal_person_identifier",
			"display": [
				{
					"locale": "en-US",
					"label": "Legal entity ID",
					"description": "Unique identifier of the legal entity being represented."
				}
			]
		},
		{
			"path": [
				"legal_name"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "legal_name",
			"display": [
				{
					"locale": "en-US",
					"label": "Legal entity name",
					"description": "Name of the legal entity being represented."
				}
			]
		},
		{
			"path": [
				"full_powers"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "full_powers",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
					"label": "Designated eService",
					"description": "Identifies the eServices in relation to which the natural person is empowered to represent the legal entity."
				}
			]
		},
		{
			"path": [
				"issuing_authority"
			],
			"mandatory": true,
			"sd": "never",
			"display": [
				{
					"locale": "en-US",
					"label": "Issuing authority",
					"description": "Legal name of the issuing entity."
				}
			]
		},
		{
			"path": [
				"issuing_country"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "issuing_country",
			"display": [
				{
					"locale": "en-US",
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
					"locale": "en-US",
					"label": "Effective until",
					"description": "End date of valid representation (inclusive)."
				}
			]
		},
		{
			"path": [
				"effective_from_date"
			],
			"mandatory": true,
			"sd": "never",
			"svg_id": "effective_from_date",
			"display": [
				{
					"locale": "en-US",
					"label": "Effective from",
					"description": "Start date of valid representation (inclusive)."
				}
			]
		}
	]
}
