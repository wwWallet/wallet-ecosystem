import { config } from "../../config";
import { createSRI } from "../sriGenerator";

export const diplomaMetadata = {
	"vct": 'urn:credential:diploma',
	"name": "Diploma Credential",
	"description": "This is a Bachelor Diploma verifiable credential",
	"display": [
		{
			"locale": "en-US",
			"name": "Diploma Credential",
			"rendering": {
				"simple": {
					"logo": {
						"uri": config.url + "/images/logo.png",
						"uri#integrity": createSRI("./public/images/template-diploma.svg"),
						"alt_text": "Diploma Logo"
					},
					"background_color": "#4CC3DD",
					"text_color": "#FFFFFF"
				},
				"svg_templates": [
					{
						"uri": config.url + "/images/template-diploma.svg",
					}
				],
			}
		}
	],
	"claims": [
		{
			"path": ["given_name"],
			"display": [
				{
					"locale": "en-US",
					"label": "Given Name",
					"description": "The given name of the Diploma Holder"
				}
			],
			"svg_id": "given_name"
		},
		{
			"path": ["family_name"],
			"display": [
				{
					"locale": "en-US",
					"label": "Family Name",
					"description": "The family name of the Diploma Holder"
				}
			],
			"svg_id": "family_name"
		},
		{
			"path": ["title"],
			"display": [
				{
					"locale": "en-US",
					"label": "Diploma Title",
					"description": "The title of the Diploma"
				}
			],
			"svg_id": "title"
		},
		{
			"path": ["grade"],
			"display": [
				{
					"locale": "en-US",
					"label": "Grade",
					"description": "Graduate's grade (0-10)"
				}
			],
		},
		{
			"path": ["eqf_level"],
			"display": [
				{
					"locale": "en-US",
					"label": "EQF Level",
					"description": "The EQF level of the diploma according to https://europass.europa.eu/en/description-eight-eqf-levels"
				}
			],
		},
		{
			"path": ["graduation_date"],
			"display": [
				{
					"locale": "en-US",
					"label": "Graduation Date",
					"description": "The graduation data"
				}
			],
			"svg_id": "graduation_date"
		},
		{
			"path": ["expiry_date"],
			"display": [
				{
					"locale": "en-US",
					"label": "Expiry Date",
					"description": "The date and time expired this credential"
				}
			],
			"svg_id": "expiry_date"
		}
	],
}
