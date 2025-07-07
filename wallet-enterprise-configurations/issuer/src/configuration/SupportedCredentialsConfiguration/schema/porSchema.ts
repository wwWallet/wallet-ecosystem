import { config } from "../../../../config";

export const porSchema = {
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": config.url + "/por-schema",
	"title": "POTENTIAL POR SD-JWT VC Schema",
	"$comment": "Based on the Power Of Representation Rulebook v1.2 of the LSP POTENTIAL UC1.",
	"type": "object",
	"properties": {
		"vct": {
			"type": "string",
			"description": "Verifiable Credential Type identifier, as defined in ietf-oauth-sd-jwt-vc (draft 09).",
			"enum": [
				"urn:eu.europa.ec.eudi:por:1"
			]
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
			"required": [
				"jwk"
			],
			"additionalProperties": true
		},
		"exp": {
			"type": "integer",
			"description": "Expiration time on or after which the JWT must not be accepted for processing, represented as a NumericDate (number of seconds since 1970-01-01T00:00:00Z UTC) according to RFC 7519 (JWT)."
		},
		"nbf": {
			"type": "integer",
			"description": "Not before time before which the JWT must not be accepted for processing, represented as a NumericDate (number of seconds since 1970-01-01T00:00:00Z UTC) according to RFC 7519 (JWT)."
		},
		"legal_person_identifier": {
			"type": "string",
			"description": "Identifier of the legal person (eIDAS specifications 1.3).",
			"maxLength": 150
		},
		"legal_name": {
			"type": "string",
			"description": "Name of the legal person (eIDAS specifications 1.3).",
			"maxLength": 150
		},
		"full_powers": {
			"type": "boolean",
			"description": "Indication whether natural person has full powers to represent the company."
		},
		"eService": {
			"type": "string",
			"description": "The service for which the natural person has the power to represent the company.",
			"maxLength": 150
		},
		"issuing_authority": {
			"type": "string",
			"minLength": 2,
			"maxLength": 150,
			"description": "Legal name of the issuing entity."
		},
		"issuing_country": {
			"type": "string",
			"pattern": "^[A-Z]{2}$",
			"description": "Country code (ISO 3166-1 alpha-2) of the issuing entity."
		},
		"effective_until_date": {
			"type": "string",
			"format": "date-time",
			"pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$",
			"description": "Date until which the power to represent the company is effective. The date is included in the validity period, so on this date the powers are valid.",
			"$comment": "Value must conform to RFC 3339 'date-time' format without fractions of a second and with 'Z' time zone offset only."
		},
		"effective_from_date": {
			"type": "string",
			"format": "date-time",
			"pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$",
			"description": "Date from which the power to represent the company is effective. The date is included in the validity period, so on this date the powers are valid.",
			"$comment": "Value must conform to RFC 3339 'date-time' format without fractions of a second and with 'Z' time zone offset only."
		}
	},
	"required": [
		"vct",
		"sub",
		"iss",
		"iat",
		"cnf",
		"legal_person_identifier",
		"legal_name",
		"full_powers",
		"issuing_authority",
		"issuing_country",
		"effective_from_date"
	]
}
