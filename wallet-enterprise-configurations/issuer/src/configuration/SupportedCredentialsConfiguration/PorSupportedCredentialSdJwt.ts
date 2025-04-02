import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat } from "core/dist/types";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import base64url from "base64url";
import { Request } from "express";
import { issuerSigner } from "../issuerSigner";
import { parsePorData } from "../datasetParser";
import path from "node:path";
import fs from 'fs';
import { AuthenticationChain, AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GenericAuthenticationMethodSelectionComponent } from "../../authentication/authenticationComponentTemplates/GenericAuthenticationMethodSelectionComponent";
import { GenericVIDAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericVIDAuthenticationComponent";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";
import { initializeCredentialEngine } from "../../lib/initializeCredentialEngine";

const datasetName = "por-dataset.xlsx";
parsePorData(path.join(__dirname, `../../../../dataset/${datasetName}`)) // test parse

export class PorSupportedCredentialSdJwt implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getAuthenticationChain(): AuthenticationChain {
		return new AuthenticationChainBuilder()
			.addAuthenticationComponent(new GenericAuthenticationMethodSelectionComponent(this.getScope() + "-auth-method", CONSENT_ENTRYPOINT, [{ code: UserAuthenticationMethod.VID_AUTH, description: "Authentication with PID" }]))
			.addAuthenticationComponent(new GenericVIDAuthenticationComponent(this.getScope() + "-vid-authentication", CONSENT_ENTRYPOINT, {
				"family_name": { input_descriptor_constraint_field_name: "Family Name" },
				"given_name": { input_descriptor_constraint_field_name: "Given Name" },
				"birth_date": { input_descriptor_constraint_field_name: "Birth Date", parser: (value: string) => new Date(value).toISOString() },
			}, "PidMinimal", "PID", this.getScope()))
			.build();
	}

	getScope(): string {
		return "por:sd_jwt_vc";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:eu.europa.ec.eudi:por:1";
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "POR", this.getId()];
	}

	getDisplay() {
		return {
			name: "Power of Representation - SD-JWT VC",
			description: "Power of Representation - SD-JWT VC",
			background_image: { uri: config.url + "/images/background-image.png" },
			background_color: "#1b263b",
			text_color: "#FFFFFF",
			locale: 'en-US',
		}
	}

	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.family_name || !userSession?.given_name || !userSession?.birth_date) {
			return null;
		}
		const users = parsePorData(path.join(__dirname, "../../../../dataset/por-dataset.xlsx"));

		if (!users) {
			console.error("Failed to load users")
			return null;
		}

		const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template-por.svg"), 'utf-8');

		let porEntry = users.filter((por) =>
			por.family_name == userSession.family_name &&
			por.given_name == userSession.given_name &&
			new Date(por.birth_date).toISOString() == new Date(userSession.birth_date as string).toISOString()
		)[0];

		console.log("Por entry = ", porEntry)
		porEntry = {
			...porEntry,
			"effective_from_date": new Date(porEntry.effective_from_date).toISOString(),
			"effective_until_date": porEntry.effective_until_date && new Date(porEntry.effective_until_date).toISOString(),
		};

		const credentialView: CredentialView = await (async () => {
			const rows: CategorizedRawCredentialViewRow[] = [
				{ name: "Legal Name", value: porEntry.legal_name },
				{ name: "Legal Person Identifier", value: porEntry.legal_person_identifier },
				{ name: "Full Powers", value: porEntry.full_powers },
				{ name: "Effective From", value: porEntry.effective_from_date },
				{ name: "Effective Until", value: porEntry.effective_until_date },
			];
			const rowsObject: CategorizedRawCredentialView = { rows };


			const { credentialRendering } = await initializeCredentialEngine();
			const dataUri = await credentialRendering.renderSvgTemplate({
				json: { ...porEntry },
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
		})();


		return credentialView;
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, request: Request, holderPublicKeyJwk: JWK): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession?.family_name || !userSession.given_name || !userSession.birth_date) {
			console.log("Cannot generate credential: family_name or given_name or birth_date is missing")
			throw new Error("Cannot generate credential: family_name or given_name or birth_date is missing");
		}

		const users = parsePorData(path.join(__dirname, "../../../../dataset/por-dataset.xlsx"));

		if (!users) {
			throw new Error("Failed to get users from dataset");
		}

		if (request.body?.vct != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
			console.log("Not the correct credential");
			throw new Error("Not the correct credential");
		}

		const porEntry = users.filter((por) =>
			por.family_name == userSession.family_name &&
			por.given_name == userSession.given_name &&
			new Date(por.birth_date).toISOString() == new Date(userSession.birth_date as string).toISOString()
		)[0];


		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:por:${randomUUID()}`,
			"legal_person_identifier": String(porEntry.legal_person_identifier),
			"legal_name": String(porEntry.legal_name),
			"full_powers": String(porEntry.full_powers),

			"effective_from_date": new Date(porEntry.effective_from_date).toISOString(),
			"effective_until_date": porEntry.effective_until_date && new Date(porEntry.effective_until_date).toISOString(),
			"eService": porEntry.eService == "" ? null : porEntry.eService,
		};


		const disclosureFrame = {
			legal_person_identifier: true,
			legal_name: true,
			full_powers: true,
			effective_until_date: true,
			effective_from_date: true,
			eService: true,
		};

		const { credential } = await this.getCredentialSigner()
			.signSdJwtVc(payload, { typ: VerifiableCredentialFormat.VC_SDJWT, vctm: [base64url.encode(JSON.stringify(this.metadata()))] }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: credential
		};

		return response;
	}

	public metadata(): any {
		return {
			"vct": this.getId(),
			"name": "Power of Representation",
			"description": "Power of Representation VC in sd_jwt format",
			"display": [
				{
					"lang": "en-US",
					"name": "Power of Representation",
					"rendering": {
						"simple": {
							"logo": {
								"uri": config.url + "/images/logo.png",
								"uri#integrity": "sha256-acda3404c2cf46da192cf245ccc6b91edce8869122fa5a6636284f1a60ffcd86",
								"alt_text": "VID Logo"
							},
							"background_color": "#4cc3dd",
							"text_color": "#FFFFFF"
						},
						"svg_templates": [
							{
								"uri": config.url + "/images/template-por.svg",
							}
						],
					}
				}
			],
			"claims": [
				{
					"path": ["legal_name"],
					"display": [
						{
							"lang": "en-US",
							"label": "Legal Name",
							"description": "The Legal name of the Power of Representation credential"
						}
					],
					"svg_id": "legal_name"
				},
				{
					"path": ["legal_person_identifier"],
					"display": [
						{
							"lang": "en-US",
							"label": "legal_person_identifier",
							"description": "The Legal legal person identifier of the Power of Representation credential"
						}
					],
					"svg_id": "legal_person_identifier"
				},
				{
					"path": ["full_powers"],
					"display": [
						{
							"lang": "en-US",
							"label": "full Powers",
							"description": "The full Powers of the Power of Representation credential"
						}
					],
					"svg_id": "full_powers"
				},
				{
					"path": ["effective_from_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Effective from date",
							"description": "The effective from date"
						}
					],
					"svg_id": "effective_from_date"
				},
				{
					"path": ["effective_until_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Effective until date",
							"description": "The effective until date"
						}
					],
					"svg_id": "effective_until_date"
				},
			],
		}

	}

	exportCredentialSupportedObject(): any {
		return {
			scope: this.getScope(),
			vct: this.getId(),
			display: [this.getDisplay()],
			format: this.getFormat(),
			cryptographic_binding_methods_supported: ["ES256"],
			credential_signing_alg_values_supported: ["ES256"],
			proof_types_supported: {
				jwt: {
					proof_signing_alg_values_supported: ["ES256"]
				}
			}
		}
	}
}
