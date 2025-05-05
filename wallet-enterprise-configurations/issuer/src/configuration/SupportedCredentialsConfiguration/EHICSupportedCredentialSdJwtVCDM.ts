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

const datasetName = "ehic-dataset.xlsx";
parseEhicData(path.join(__dirname, `../../../../dataset/${datasetName}`)) // test parse

export class EHICSupportedCredentialSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getAuthenticationChain(): AuthenticationChain {
		return new AuthenticationChainBuilder()
			.addAuthenticationComponent(new GenericAuthenticationMethodSelectionComponent(this.getScope() + "-auth-method", CONSENT_ENTRYPOINT, [{ code: UserAuthenticationMethod.VID_AUTH, description: "Authentication with PID" }, { code: UserAuthenticationMethod.SSO, description: "Authentication with National Services" }]))
			.addAuthenticationComponent(new GenericVIDAuthenticationComponent(this.getScope() + "-vid-authentication", CONSENT_ENTRYPOINT, {
				"family_name": { input_descriptor_constraint_field_name: "Family Name" },
				"given_name": { input_descriptor_constraint_field_name: "Given Name" },
				"birth_date": { input_descriptor_constraint_field_name: "Birth Date", parser: (value: string) => new Date(value).toISOString() },
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
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "EuropeanHealthInsuranceCard", this.getId()];
	}
	getDisplay() {
		return {
			name: "EHIC - SD-JWT VC",
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
						{ name: "Social Security Number", value: String(ehic.ssn) },
						{ name: "Document Number", value: String(ehic.document_number) },
						{ name: "Issuing Country", value: ehic.issuer_country },
						{ name: "Issuing Authority (ID)", value: ehic.issuer_institution_code },
						{ name: "Issuing Authority (Name)", value: ehic.issuer_institution_name },

					];
					const rowsObject: CategorizedRawCredentialView = { rows };
					const { credentialRendering } = await initializeCredentialEngine();
					const dataUri = await credentialRendering.renderSvgTemplate({
						json: { ...ehic },
						credentialImageSvgTemplate: svgText,
						sdJwtVcMetadataClaims: this.metadata().claims,
					});
					console.log("Data uri = ", dataUri);
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

		if (request.body?.vct != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
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
			social_security_number: String(ehicEntry.ssn),
			birth_date: new Date(ehicEntry.birth_date).toISOString(),
			issuance_date: new Date().toISOString().split('T')[0],  // full-date format, according to ARF PID Rulebook
			issuing_country: String(ehicEntry.issuer_country),
			issuing_authority: {
				id: String(ehicEntry.issuer_institution_code),
				name: String(ehicEntry.issuer_institution_name)
			},
			expiry_date: new Date(ehicEntry.expiry_date).toISOString(),
			document_number: String(ehicEntry.document_number)
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:eudi:ehic:1:${randomUUID()}`,
			...ehic
		};

		const disclosureFrame = {
			social_security_number: true,
			issuing_country: true,
			issuing_authority: {
				id: true,
				name: true
			},
			document_number: true
		}
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
					"path": ["social_security_number"],
					"display": [
						{
							"lang": "en-US",
							"label": "Social Security Number",
							"description": "The social security number of the EHIC holder"
						}
					],
					"svg_id": "ssn"
				},
				{
					"path": ["issuing_country"],
					"display": [
						{
							"lang": "en-US",
							"label": "Issuer Country",
							"description": "The issuer country of the EHIC holder"
						}
					],
					"svg_id": "issuer_country"
				},
				{
					"path": ["issuing_authority", "id"],
					"display": [
						{
							"lang": "en-US",
							"label": "Issuer Institution Code",
							"description": "The issuer institution code of the EHIC holder"
						}
					],
					"svg_id": "issuer_institution_code"
				},
				{
					"path": ["expiry_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Expiry Date",
							"description": "The date and time expired this credential"
						}
					],
					"svg_id": "expiry_date"
				}
			],
		}

	}

	exportCredentialSupportedObject(): any {
		return {
			scope: this.getScope(),
			vct: this.getId(),
			format: this.getFormat(),
			display: [this.getDisplay()],
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
