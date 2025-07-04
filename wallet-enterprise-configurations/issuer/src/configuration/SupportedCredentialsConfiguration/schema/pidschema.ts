import { config } from "../../../../config";

export const pidSchema_1_5 = {
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": config.url + "/pid-1-5-schema",
	"title": "Example ARF 1.5 PID SD-JWT VC Schema",
	"$comment": "Implementation of this example schema may require Member State–specific clarifications to align with national policies governing the included attributes.",
	"type": "object",
	"properties": {
		"vct": {
			"type": "string",
			"description": "Verifiable Credential Type identifier, as defined in ietf-oauth-sd-jwt-vc (draft 09). Adheres to PID Rulebook ARF 1.5 (urn:eu.europa.ec.eudi:pid:1).",
			"enum": [
				"urn:eu.europa.ec.eudi:pid:1"
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
		"family_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Current last name(s) or surname(s), as recognized by the issuing authority. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"given_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Current first name(s), including middle name(s) where applicable. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"birth_date": {
			"type": "string",
			"format": "date",
			"description": "Date of birth expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339."
		},
		"birth_place": {
			"type": "string",
			"minLength": 2,
			"maxLength": 100,
			"description": "Place of birth, including country (ISO 3166-1 alpha-2 code) and, optionally, state, city, or locality"
		},
		"nationality": {
			"type": "array",
			"items": {
				"type": "string",
				"pattern": "^[A-Z]{2}$"
			},
			"description": "List of two-letter country codes (ISO 3166-1 alpha-2) representing the nationality. If the person has multiple nationalities and the PID provider supports asserting them, they may all be included in this array. Note that selective disclosure of a single nationality is not supported if the array is presented as a whole. It is recommended that only the primary nationality be included here, and any additional nationalities be provided as separate domestic claims, as determined by the PID provider."
		},
		"personal_administrative_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "Unique personal identifier assigned by the authority to the natural person. The electronic identification scheme under which the identifier is issued, as well as the policy applied to the values of this attribute—including, where applicable, specific conditions for its processing—must be defined by the PID provider as part of this schema."
		},
		"portrait": {
			"type": "string",
			"format": "uri",
			"pattern": "^data:image\\/jpeg;base64,[A-Za-z0-9+/=]+$",
			"minLength": 10240,
			"maxLength": 65536,
			"description": "Portrait consist of a single image in JPEG format that meets the quality requirements for a Full Frontal Image Type as defined in ISO/IEC 19794-5:2011, clauses 8.2, 8.3, and 8.4. The portrait should not follow the format structure defined in clauses 8.1 and 8.5, and should not include headers or data blocks described in clause 5. Only the raw JPEG image data should be present."
		},
		"family_name_birth": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Last name(s) or surname(s) at the time of birth. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"given_name_birth": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "First name(s), including middle name(s), at the time of birth. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"sex": {
			"type": "integer",
			"description": "Sex or gender of the individual represented as a numeric code. Values shall be one of the following: 0 = not known; 1 = male; 2 = female; 3 = other; 4 = inter; 5 = diverse; 6 = open; 9 = not applicable. For values 0, 1, 2 and 9, ISO/IEC 5218 applies. The precise interpretation and usage of values beyond ISO/IEC 5218 is to be defined by the PID provider as part of this schema.",
			"enum": [
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				9
			]
		},
		"email_address": {
			"type": "string",
			"format": "email",
			"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
			"minLength": 1,
			"maxLength": 256,
			"description": "Email address in a valid format as defined by a simplified interpretation of RFC 5322. The address must include an '@' symbol and a valid domain, with a top-level domain of at least two characters."
		},
		"mobile_phone_number": {
			"type": "string",
			"pattern": "^\\+[1-9][0-9]{1,14}$",
			"minLength": 8,
			"maxLength": 16,
			"description": "Mobile phone number in international format as defined by ITU-T E.164. The number must begin with a '+' followed by the country code and national number, and contain no spaces or special characters. Maximum length is 15 digits after the '+' sign."
		},
		"resident_address": {
			"type": "string",
			"minLength": 2,
			"maxLength": 512,
			"description": "Full formatted address constructed from individual address components, following national formatting conventions and international postal standards such as UPU S42 and ISO 19160-4. The formatting logic and rules are to be defined by the PID provider as part of this schema."
		},
		"resident_street": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Street name of the residence address."
		},
		"resident_house_number": {
			"type": "string",
			"minLength": 1,
			"maxLength": 20,
			"description": "House or building number of the residence address."
		},
		"resident_postal_code": {
			"type": "string",
			"minLength": 1,
			"maxLength": 20,
			"description": "Postal or ZIP code of the residence address."
		},
		"resident_city": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "City, town, or locality of the residence address."
		},
		"resident_state": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "State, province, or administrative division of residence address."
		},
		"resident_country": {
			"type": "string",
			"pattern": "^[A-Z]{2}$",
			"description": "Country code (ISO 3166-1 alpha-2) of the residence address."
		},
		"age_over_14": {
			"type": "boolean",
			"description": "Boolean indicator of whether the person is at least 14 years old."
		},
		"age_over_16": {
			"type": "boolean",
			"description": "Boolean indicator of whether the person is at least 16 years old."
		},
		"age_over_18": {
			"type": "boolean",
			"description": "Boolean indicator of whether the person is at least 18 years old."
		},
		"age_over_21": {
			"type": "boolean",
			"description": "Boolean indicator of whether the person is at least 21 years old."
		},
		"age_over_65": {
			"type": "boolean",
			"description": "Boolean indicator of whether the person is at least 65 years old."
		},
		"age_in_years": {
			"type": "integer",
			"description": "Age in full years, derived from the birth date."
		},
		"age_birth_year": {
			"type": "integer",
			"description": "Year of birth represented as a four-digit number."
		},
		"issuing_authority": {
			"type": "string",
			"minLength": 2,
			"maxLength": 100,
			"description": "Legal name of the authority, or the Member State code (ISO 3166-1 alpha-2) if no separate authority is entitled to issue the person identification data (PID)."
		},
		"issuing_country": {
			"type": "string",
			"pattern": "^[A-Z]{2}$",
			"description": "Member State code (ISO 3166-1 alpha-2) representing the country under whose jurisdiction the PID is issued."
		},
		"expiry_date": {
			"type": "string",
			"format": "date",
			"description": "Date determined by the PID provider as the end of the administrative validity period of the identity record represented by this PID, or the expiration date of the PID credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the PID provider as part of this schema."
		},
		"issuance_date": {
			"type": "string",
			"format": "date",
			"description": "Date determined by the PID provider as either the start of the administrative validity period of the identity record represented by this PID, or the issuance date of the PID credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the PID provider as part of this schema."
		},
		"document_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "Unique document identifier assigned by the PID provider. This value identifies the specific PID document and may be used for administrative validation."
		},
		"issuing_jurisdiction": {
			"type": "string",
			"minLength": 2,
			"maxLength": 100,
			"description": "Member State subdivision code of the jurisdiction that issued the person identification data, as specified in ISO 3166-2:2020, Clause 8. The first part of the code shall be the same as the value for the issuing country."
		},
		"trust_anchor": {
			"type": "string",
			"format": "uri",
			"description": "Location or endpoint where the trust anchor can be accessed for credential verification."
		}
	},
	"required": [
		"vct",
		"sub",
		"iss",
		"iat",
		"cnf",
		"family_name",
		"given_name",
		"birth_date",
		"birth_place",
		"nationality",
		"expiry_date",
		"issuing_authority",
		"issuing_country"
	]
}

export const pidSchema_1_8 = {
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": config.url + "/pid-1-8-schema",
	"title": "Example ARF 1.8 PID SD-JWT VC Schema",
	"$comment": "Implementation of this example schema may require Member State–specific clarifications to align with national policies governing the included attributes.",
	"type": "object",
	"properties": {
		"vct": {
			"type": "string",
			"description": "Verifiable Credential Type identifier, as defined in ietf-oauth-sd-jwt-vc (draft 09). Adheres to PID Rulebook ARF 1.8 (urn:eudi:pid:1) and later, as of the time of publication.",
			"enum": [
				"urn:eudi:pid:1"
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
		"family_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Current last name(s) or surname(s), as recognized by the issuing authority. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"given_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Current first name(s), including middle name(s) where applicable. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"birthdate": {
			"type": "string",
			"format": "date",
			"description": "Date of birth expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339."
		},
		"place_of_birth": {
			"type": "object",
			"description": "Structured place of birth, following [eKYC-IDA] Section 4.1. At least one of 'country', 'region', or 'locality' must be present.",
			"properties": {
				"country": {
					"type": "string",
					"pattern": "^[A-Z]{2}$",
					"description": "Country of birth in ISO 3166-1 alpha-2 code."
				},
				"region": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "State, province, district, or local area of birth."
				},
				"locality": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "Municipality, city, town, or village of birh."
				}
			},
			"anyOf": [
				{ "required": ["locality"] },
				{ "required": ["region"] },
				{ "required": ["country"] }
			],
			"additionalProperties": false
		},
		"nationalities": {
			"type": "array",
			"items": {
				"type": "string",
				"pattern": "^[A-Z]{2}$"
			},
			"description": "List of two-letter country codes (ISO 3166-1 alpha-2) representing the nationality. If the person has multiple nationalities and the PID provider supports asserting them, they may all be included in this array. Note that selective disclosure of a single nationality is not supported if the array is presented as a whole. It is recommended that only the primary nationality be included here, and any additional nationalities be provided as separate domestic claims, as determined by the PID provider."
		},
		"personal_administrative_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "Unique personal identifier assigned by the authority to the natural person. The electronic identification scheme under which the identifier is issued, as well as the policy applied to the values of this attribute—including, where applicable, specific conditions for its processing—must be defined by the PID provider as part of this schema."
		},
		"picture": {
			"type": "string",
			"format": "uri",
			"pattern": "^data:image\\/jpeg;base64,[A-Za-z0-9+/=]+$",
			"minLength": 10240,
			"maxLength": 65536,
			"description": "Picture consist of a single image in JPEG format that meets the quality requirements for a Full Frontal Image Type as defined in ISO/IEC 19794-5:2011, clauses 8.2, 8.3, and 8.4. The picture should not follow the format structure defined in clauses 8.1 and 8.5, and should not include headers or data blocks described in clause 5. Only the raw JPEG image data should be present."
		},
		"birth_family_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "Last name(s) or surname(s) at the time of birth. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"birth_given_name": {
			"type": "string",
			"minLength": 1,
			"maxLength": 100,
			"description": "First name(s), including middle name(s), at the time of birth. Representation should follow recommended best practices from international identity document standards (e.g., ICAO Doc 9303, ISO/IEC 7501-1, and general government-issued document formatting), to be defined by the PID provider as part of this schema."
		},
		"sex": {
			"type": "integer",
			"description": "Sex or gender of the individual represented as a numeric code. Values shall be one of the following: 0 = not known; 1 = male; 2 = female; 3 = other; 4 = inter; 5 = diverse; 6 = open; 9 = not applicable. For values 0, 1, 2 and 9, ISO/IEC 5218 applies. The precise interpretation and usage of values beyond ISO/IEC 5218 is to be defined by the PID provider as part of this schema.",
			"enum": [
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				9
			]
		},
		"email": {
			"type": "string",
			"format": "email",
			"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
			"minLength": 1,
			"maxLength": 256,
			"description": "Email address in a valid format as defined by a simplified interpretation of RFC 5322. The address must include an '@' symbol and a valid domain, with a top-level domain of at least two characters."
		},
		"phone_number": {
			"type": "string",
			"pattern": "^\\+[1-9][0-9]{1,14}$",
			"minLength": 8,
			"maxLength": 16,
			"description": "Mobile phone number in international format as defined by ITU-T E.164. The number must begin with a '+' followed by the country code and national number, and contain no spaces or special characters. Maximum length is 15 digits after the '+' sign."
		},
		"address": {
			"type": "object",
			"description": "Structured address object containing individual and formatted address components.",
			"properties": {
				"formatted": {
					"type": "string",
					"minLength": 2,
					"maxLength": 512,
					"description": "Full formatted address constructed from individual address components, following national formatting conventions and international postal standards such as UPU S42, ISO 19160-4, and Section 5.1.1 of OIDC Core 1.0."
				},
				"street_address": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "Street name of the address."
				},
				"house_number": {
					"type": "string",
					"minLength": 1,
					"maxLength": 20,
					"description": "House or building number of the address."
				},
				"postal_code": {
					"type": "string",
					"minLength": 1,
					"maxLength": 20,
					"description": "Postal or ZIP code of the address."
				},
				"locality": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "City, town, or locality of the address."
				},
				"region": {
					"type": "string",
					"minLength": 1,
					"maxLength": 100,
					"description": "State, province, or administrative division of the address."
				},
				"country": {
					"type": "string",
					"pattern": "^[A-Z]{2}$",
					"description": "Country code (ISO 3166-1 alpha-2) of the address."
				}
			},
			"required": ["country"],
			"additionalProperties": false
		},
		"age_equal_or_over": {
			"type": "object",
			"description": "Indicates whether the person is at least the specified ages. Boolean values indicate compliance with each threshold.",
			"properties": {
				"14": { "type": "boolean" },
				"16": { "type": "boolean" },
				"18": { "type": "boolean" },
				"21": { "type": "boolean" },
				"65": { "type": "boolean" }
			},
			"additionalProperties": false,
			"minProperties": 1
		},
		"age_in_years": {
			"type": "integer",
			"description": "Age in full years, derived from the birth date."
		},
		"age_birth_year": {
			"type": "integer",
			"description": "Year of birth represented as a four-digit number."
		},
		"issuing_authority": {
			"type": "string",
			"minLength": 2,
			"maxLength": 100,
			"description": "Legal name of the authority, or the Member State code (ISO 3166-1 alpha-2) if no separate authority is entitled to issue the person identification data (PID)."
		},
		"issuing_country": {
			"type": "string",
			"pattern": "^[A-Z]{2}$",
			"description": "Member State code (ISO 3166-1 alpha-2) representing the country under whose jurisdiction the PID is issued."
		},
		"date_of_expiry": {
			"type": "string",
			"format": "date",
			"description": "Date determined by the PID provider as the end of the administrative validity period of the identity record represented by this PID, or the expiration date of the PID credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the PID provider as part of this schema."
		},
		"date_of_issuance": {
			"type": "string",
			"format": "date",
			"description": "Date determined by the PID provider as either the start of the administrative validity period of the identity record represented by this PID, or the issuance date of the PID credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the PID provider as part of this schema."
		},
		"document_number": {
			"type": "string",
			"minLength": 4,
			"maxLength": 50,
			"description": "Unique document identifier assigned by the PID provider. This value identifies the specific PID document and may be used for administrative validation."
		},
		"issuing_jurisdiction": {
			"type": "string",
			"minLength": 2,
			"maxLength": 100,
			"description": "Member State subdivision code of the jurisdiction that issued the person identification data, as specified in ISO 3166-2:2020, Clause 8. The first part of the code shall be the same as the value for the issuing country."
		},
		"trust_anchor": {
			"type": "string",
			"format": "uri",
			"description": "Location or endpoint where the trust anchor can be accessed for credential verification."
		}
	},
	"required": [
		"vct",
		"sub",
		"iss",
		"iat",
		"cnf",
		"family_name",
		"given_name",
		"birthdate",
		"place_of_birth",
		"nationalities",
		"date_of_expiry",
		"issuing_authority",
		"issuing_country"
	]
}
