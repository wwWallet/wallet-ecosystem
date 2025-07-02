import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat } from "wallet-common/dist/types";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import { Request } from "express";
import { parseEhicData } from "../datasetParser";
import path from "node:path";
import { issuerSigner } from "../issuerSigner";
import fs from 'fs';
import base64url from 'base64url';
import { AuthenticationChain, AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { GenericAuthenticationMethodSelectionComponent } from "../../authentication/authenticationComponentTemplates/GenericAuthenticationMethodSelectionComponent";
import { GenericVIDAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericVIDAuthenticationComponent";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";
import { initializeCredentialEngine } from "../../lib/initializeCredentialEngine";
import { formatDateDDMMYYYY } from "../../lib/formatDate";
import { createSRI } from "../../lib/sriGenerator";

const datasetName = "ehic-dataset.xlsx";
parseEhicData(path.join(__dirname, `../../../../dataset/${datasetName}`)) // test parse

export class EHICSupportedCredentialSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getAuthenticationChain(): AuthenticationChain {
		return new AuthenticationChainBuilder()
			.addAuthenticationComponent(new GenericAuthenticationMethodSelectionComponent(this.getScope() + "-auth-method", CONSENT_ENTRYPOINT, [{ code: UserAuthenticationMethod.VID_AUTH, description: "Authentication with PID" }, { code: UserAuthenticationMethod.SSO, description: "Authentication with National Services" }]))
			.addAuthenticationComponent(new GenericVIDAuthenticationComponent(this.getScope() + "-vid-authentication", CONSENT_ENTRYPOINT, {
				"family_name": { input_descriptor_constraint_field_name: "Last Name" },
				"given_name": { input_descriptor_constraint_field_name: "First Name" },
				"birth_date": { input_descriptor_constraint_field_name: "Date of Birth", parser: (value: string) => new Date(value).toISOString() },
			}, "PidMinimal", "PID", this.getDisplay().name))
			.addAuthenticationComponent(new GenericLocalAuthenticationComponent(this.getScope() + "-1-local", CONSENT_ENTRYPOINT, {
				"family_name": { datasetColumnName: "family_name" },
				"given_name": { datasetColumnName: "given_name" },
				"birth_date": { datasetColumnName: "birth_date", parser: (value: any) => new Date(value).toISOString() },
			},
				async () => parseEhicData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
				[{ username: "john", password: "secret" }, { username: "emily", password: "secret" }]
			))
			.build();
	}

	getScope(): string {
		return "ehic";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:eudi:ehic:1"
	}

	getSchemaId(): string {
		return config.url + "/ehic-schema";
	}

	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.DC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "EuropeanHealthInsuranceCard", this.getId()];
	}
	getDisplay() {
		return {
			name: `EHIC (${this.getFormat()})`,
			description: "European Health Insurance Card",
			background_image: { uri: config.url + "/images/background-image.png" },
			background_color: "#1b263b",
			text_color: "#FFFFFF",
			locale: 'en-US',
		}
	}


	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		console.log("User session = ", userSession);
		if (!userSession?.family_name || !userSession?.given_name || !userSession?.birth_date) {
			return null;
		}
		const users = parseEhicData(path.join(__dirname, "../../../../dataset/ehic-dataset.xlsx"));

		console.log("Users = ", users)
		if (!users) {
			console.error("Failed to load users")
			return null;
		}
		try {

			const ehics = users.filter((ehic) =>
				ehic.family_name == userSession.family_name &&
				ehic.given_name == userSession.given_name &&
				new Date(ehic.birth_date).toISOString() == new Date(userSession.birth_date as string).toISOString()
			);
			console.log("Ehic = ", ehics)
			const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template-ehic.svg"), 'utf-8');
			const credentialViews: CredentialView[] = await Promise.all(ehics
				.map(async (ehic) => {
					const rows: CategorizedRawCredentialViewRow[] = [
						{ name: "Social Security PIN", value: String(ehic.personal_administrative_number) },
						{ name: "Document number", value: String(ehic.document_number) },
						{ name: "Issuing country", value: ehic.issuer_country },
						{ name: "Issuing authority id", value: ehic.issuing_authority_id },
						{ name: "Issuing authority name", value: ehic.issuing_authority_name },
						{ name: "Competent institution id", value: ehic.authentic_source_id },
						{ name: "Competent institution name", value: ehic.authentic_source_name },
						{ name: "Starting date", value: formatDateDDMMYYYY(ehic.starting_date) },
						{ name: "Ending date", value: formatDateDDMMYYYY(ehic.ending_date) },

					];
					const rowsObject: CategorizedRawCredentialView = { rows };
					const { credentialRendering } = await initializeCredentialEngine();
					const dataUri = await credentialRendering.renderSvgTemplate({
						json: {
							...ehic,
							date_of_expiry: undefined,
							authentic_source: {
								id: String(ehic.authentic_source_id),
								name: String(ehic.authentic_source_name)
							},
						},
						credentialImageSvgTemplate: svgText,
						sdJwtVcMetadataClaims: this.metadata().claims,
					});

					if (!dataUri) {
						throw new Error("Could not render svg");
					}
					return {
						credential_id: this.getId(),
						credential_supported_object: this.exportCredentialSupportedObject(),
						view: rowsObject,
						credential_image: dataUri,
					}
				}));
			return credentialViews[0];
		}
		catch (err) {
			console.error(err)
			return null;
		}

	}

	async generateCredentialResponse(userSession: AuthorizationServerState, request: Request, holderPublicKeyJwk: JWK): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession?.family_name || !userSession.given_name || !userSession.birth_date) {
			console.log("Cannot generate credential: family_name is missing")
			throw new Error("Cannot generate credential: family_name is missing");
		}

		const users = parseEhicData(path.join(__dirname, "../../../../dataset/ehic-dataset.xlsx"));

		if (!users) {
			throw new Error("Failed to get users from dataset");
		}

		if (request.body?.credential_configuration_id != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
			console.log("Not the correct credential");
			throw new Error("Not the correct credential");
		}

		const ehicEntry = users.filter((ehic) =>
			ehic.family_name == userSession.family_name &&
			ehic.given_name == userSession.given_name &&
			new Date(ehic.birth_date).toISOString() == new Date(userSession.birth_date as string).toISOString()
		)[0];

		if (!ehicEntry) {
			console.error("Possibly raw data not found")
			throw new Error("Could not generate credential response");
		}


		const ehic = {
			personal_administrative_number: String(ehicEntry.personal_administrative_number),
			date_of_issuance: new Date().toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			issuing_country: String(ehicEntry.issuer_country),
			issuing_authority: {
				id: String(ehicEntry.issuing_authority_id),
				name: String(ehicEntry.issuing_authority_name)
			},
			authentic_source: {
				id: String(ehicEntry.authentic_source_id),
				name: String(ehicEntry.authentic_source_name)
			},
			date_of_expiry: new Date(ehicEntry.date_of_expiry).toISOString().split('T')[0],
			document_number: String(ehicEntry.document_number),
			starting_date: new Date(ehicEntry.starting_date).toISOString().split('T')[0],
			ending_date: new Date(ehicEntry.ending_date).toISOString().split('T')[0]

		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.metadata().vct,
			"vct#integrity": createSRI(this.metadata()),
			"jti": `urn:eudi:ehic:1:${randomUUID()}`,
			...ehic
		};

		const disclosureFrame = {
			personal_administrative_number: true,
			issuing_country: true,
			issuing_authority: {
				id: true,
				name: true
			},
			authentic_source: {
				id: true,
				name: true
			},
			document_number: true,
			date_of_issuance: true,
			date_of_expiry: true,
			starting_date: true,
			ending_date: true
		}
		const { credential } = await this.getCredentialSigner()
			.signSdJwtVc(payload, { typ: VerifiableCredentialFormat.DC_SDJWT, vctm: [base64url.encode(JSON.stringify(this.metadata()))] }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: credential
		};

		return response;
	}

	public metadata(): any {
		return {
			"vct": "urn:eudi:ehic:1",
			"name": "EHIC",
			"description": "This is a European Health Insurance Card verifiable credential",
			"display": [
				{
					"lang": "en-US",
					"name": "EHIC",
					"rendering": {
						"simple": {
							"background_color": "#1b263b",
							"text_color": "#FFFFFF"
						},
						"svg_templates": [
							{
								"uri": config.url + "/images/template-ehic.svg",
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
					"display": [
						{
							"lang": "en-US",
							"description": "Verifiable Credential unique identifier to prevent replay attacks."
						}
					],
				},
				{
					"path": [
						"sub"
					],
					"sd": "never",
					"display": [
						{
							"lang": "en-US",
							"description": "Subject identifier for the JWT, representing the principal that is the subject of the JWT."
						}
					],
				},
				{
					"path": [
						"iat"
					],
					"sd": "never",
					"display": [
						{
							"lang": "en-US",
							"description": "Issued at time indicating when the JWT was issued."
						}
					],
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
							"description": "The issuer country of the EHIC holder"
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
							"description": "EHIC issuing authority unique identifier in EESSI."
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
							"description": "EHIC issuing authority name in EESSI."
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
			"schema_uri": this.getSchemaId(),
			"schema_uri#integrity": createSRI(this.schema())
		}

	}

	public schema(): any {
		return {
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"$id": this.getSchemaId(),
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
	}

	exportCredentialSupportedObject(): any {
		return {
			scope: this.getScope(),
			vct: this.metadata().vct,
			format: this.getFormat(),
			display: [this.getDisplay()],
			cryptographic_binding_methods_supported: ["jwk"],
			credential_signing_alg_values_supported: ["ES256"],
			proof_types_supported: {
				jwt: {
					proof_signing_alg_values_supported: ["ES256"]
				}
			}
		}
	}
}
