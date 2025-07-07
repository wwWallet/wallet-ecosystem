import { config } from "../../../../config";

export const pda1Schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DC4EU PDA1 SD-JWT VC Schema",
	"$id": config.url + "/pda1-schema",
  "$comment": "Implementation of the DC4EU schema may require Member State-specific clarifications to align with national policies governing the included attributes.",
  "type": "object",
  "properties": {
    "vct": {
      "type": "string",
      "description": "The Verifiable Credential type identifier, as defined in ietf-oauth-sd-jwt-vc (draft 09).",
      "enum": [
        "urn:eudi:pda1:1"
      ]
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
    "personal_administrative_number": {
      "type": "string",
      "minLength": 4,
      "maxLength": 50,
      "description": "The unique personal identifier assigned to the natural person for social security services and benefits by the competent institution. The electronic identification scheme under which the identifier is issued, as well as the policy applied to the values of this attribute—including, where applicable, specific conditions for its processing—must be defined by the competent institution as part of this schema."
    },
    "employer": {
      "type": "object",
      "description": "The employer details, based on EU or Member State registries.",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 20,
          "description": "The unique identifier of the employer, in EU or Member State registries."
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "The full name of the employer, in EU or Member State registries."
        },
        "country": {
          "type": "string",
          "pattern": "^[A-Z]{2}$",
          "description": "Country code (ISO 3166-1 alpha-2) of the country where the employer is registered."
        }
      },
      "required": [
	"id",
	"name",
	"country"
      ],
      "additionalProperties": false
    }, 
    "work_address": {
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
      "required": [
	"locality",
	"country"
      ],
      "additionalProperties": false
    }, 
    "legislation_country": {
      "type": "string",
      "pattern": "^[A-Z]{2}$",
      "description": "Country code (ISO 3166-1 alpha-2) whose legislation is to be applied during the work abroad."
    },
    "status_confirmation": {
      "type": "string",
      "pattern": "^(0[1-9]|1[0-2])$",
      "description": "Employment or posting legal framework category code applicable to the worker.",
      "$comment": "Allowed values: 01 = Posted employed person, 02 = Employed in 2+ states, 03 = Posted self-employed, 04 = Self-employed in 2+ states, 05 = Civil servant, 06 = Contract staff, 07 = Mariner, 08 = Employed & self-employed in different states, 09 = Civil servant + employed/self-employed, 10 = Flight crew, 11 = Exception, 12 = Local employment."
    },
    "issuing_authority": {
      "type": "object",
      "description": "The authority responsible for issuing the PDA1.",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 20,
          "description": "The unique identifier of the PDA1 issuing authority."
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "The full name of the PDA1 issuing authority."
        }
      },
      "required": [
        "id",
        "name"
      ],
      "additionalProperties": false
    },
    "issuing_country": {
      "type": "string",
      "pattern": "^[A-Z]{2}$",
      "description": "Member State code (ISO 3166-1 alpha-2) representing the country under whose jurisdiction the PDA1 is issued."
    },
    "date_of_expiry": {
      "type": "string",
      "format": "date",
      "description": "Date determined by the competent institution as the end of the administrative validity period of the record represented by this PDA1, or the expiration date of the PDA1 credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the competent institution as part of this schema."
    },
    "date_of_issuance": {
      "type": "string",
      "format": "date",
      "description": "Date determined by the competent institution as either the start of the administrative validity period of the record represented by this PDA1, or the issuance date of the PDA1 credential. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339. The exact interpretation is to be defined by the competent institution as part of this schema."
    },
    "authentic_source": {
      "type": "object",
      "description": "The competent insitution responsible for the PDA1, as registered in the Electronic Exchange of Social Security Information (EESSI).",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 20,
          "description": "The unique identifier of the competent insitution responsible for the PDA1, as registered in the Electronic Exchange of Social Security Information (EESSI)."
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "The full name of the competent insitution responsible for the PDA1, as registered in the Electronic Exchange of Social Security Information (EESSI)."
        }
      },
      "required": [
        "id",
        "name"
      ],
      "additionalProperties": false
    },
    "ending_date": {
      "type": "string",
      "format": "date",
      "description": "Date determined by the competent insitution as the end date of the insurance coverage. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339."
    },
    "starting_date": {
      "type": "string",
      "format": "date",
      "description": "Date determined by the competent insitution as the start date of the insurance coverage. The value is expressed as a full-date (YYYY-MM-DD) in accordance with ISO 8601-1 and RFC 3339."
    },
    "document_number": {
      "type": "string",
      "minLength": 4,
      "maxLength": 50,
      "description": "Unique document identifier assigned by the competent institution. This value identifies the specific PDA1 document and may be used for administrative validation."
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
    "employer",
    "work_address",
    "legislation_country",
    "status_confirmation",
    "issuing_authority",
    "issuing_country",
    "date_of_issuance",
    "authentic_source",
    "ending_date",
    "starting_date",
    "document_number"
  ]
}