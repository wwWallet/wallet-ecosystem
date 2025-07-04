import { config } from "../../../../config";

export const ehicSchema = {
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": config.url + "/ehic-schema",
	"title": "DC4EU EHIC SD-JWT VC Schema",
	"$comment": "Implementation of the DC4EU schema may require Member State-specific clarifications to align with national policies governing the included attributes.",
	"type": "object",
	"properties": {
		"vct": {
			"type": "string",
			"description": "The Verifiable Credential type identifier, as defined in ietf-oauth-sd-jwt-vc (draft 09).",
			"enum": ["urn:eudi:ehic:1"]
		},
		"jti": {
			"type": "string",
			"description": "Verifiable Credential unique identifier to prevent replay attacks. It needs to be unique for the JWT effective lifespan.",
			"minLength": 1,
			"maxLength": 255
		},
		"sub": {
			"type": "string",
			"description": "Subject identifier for the JWT, representing the principal that is the subject of the JWT. This is a case-sensitive string containing a unique identifier, as defined in RFC 7519 (JWT)."
		},
		"iss": {
			"type": "string",
			"format": "uri",
			"description": "Issuer identifier for the JWT, expressed as a URI, according to RFC 7519 (JWT)."
		},
		"iat": {
			"type": "integer",
			"description": "Issued at time indicating when the JWT was issued, represented as a NumericDate (number of seconds since 1970-01-01T00:00:00Z UTC) according to RFC 7519 (JWT)."
		},
		"cnf": {
			"type": "object",
			"description": "Contains confirmation key information used to prove possession of a private key, as defined in RFC 7800 (Proof-of-Possession Key Semantics for JWTs).",
			"properties": {
				"jwk": {
					"type": "object",
					"description": "JSON Web Key (JWK) object. Structure not fully specified here."
				}
			},
			"required": ["jwk"],
			"additionalProperties": true
		},
		"exp": {
			"type": "integer",
			"description": "Expiration time on or after which the JWT must not be accepted for processing, represented as a NumericDate."
		},
		"nbf": {
			"type": "integer",
			"description": "Not before time before which the JWT must not be accepted for processing, represented as a NumericDate."
		},
		"personal_administrative_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "The unique personal identifier assigned to the natural person for social security services and benefits by the competent institution."
		},
		"issuing_authority": {
			"type": "object",
			"description": "The authority responsible for issuing the EHIC.",
			"properties": {
				"id": {
					"type": "string",
					"minLength": 1,
					"maxLength": 20,
					"description": "The unique identifier of the EHIC issuing authority."
				},
				"name": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "The full name of the EHIC issuing authority."
				}
			},
			"required": ["id", "name"],
			"additionalProperties": false
		},
		"issuing_country": {
			"type": "string",
			"pattern": "^[A-Z]{2}$",
			"description": "Member State code (ISO 3166-1 alpha-2) representing the country under whose jurisdiction the EHIC is issued."
		},
		"date_of_expiry": {
			"type": "string",
			"format": "date",
			"description": "Date representing the end of administrative validity or expiration of the EHIC."
		},
		"date_of_issuance": {
			"type": "string",
			"format": "date",
			"description": "Date representing the start of administrative validity or issuance of the EHIC."
		},
		"authentic_source": {
			"type": "object",
			"description": "The competent institution responsible for the EHIC, as registered in EESSI.",
			"properties": {
				"id": {
					"type": "string",
					"minLength": 1,
					"maxLength": 20,
					"description": "Unique identifier of the institution."
				},
				"name": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "Full name of the institution."
				}
			},
			"required": ["id", "name"],
			"additionalProperties": false
		},
		"ending_date": {
			"type": "string",
			"format": "date",
			"description": "End date of insurance coverage."
		},
		"starting_date": {
			"type": "string",
			"format": "date",
			"description": "Start date of insurance coverage."
		},
		"document_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "Unique identifier of the EHIC document."
		}
	},
	"required": [
		"vct",
		"jti",
		"sub",
		"iss",
		"iat",
		"cnf",
		"personal_administrative_number",
		"issuing_authority",
		"issuing_country",
		"date_of_issuance",
		"authentic_source",
		"document_number"
	]
};
