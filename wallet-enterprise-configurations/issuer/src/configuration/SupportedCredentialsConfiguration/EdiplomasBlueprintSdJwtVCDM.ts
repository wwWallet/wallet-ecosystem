import { config } from "../../../config";
import { VerifiableCredentialFormat } from "core/dist/types";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { formatDateDDMMYYYY } from "../../lib/formatDate";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { issuerSigner } from "../issuerSigner";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import { parseDiplomaData } from "../datasetParser";
import path from "path";
import { randomUUID } from "crypto";
import { Request } from "express";
import fs from 'fs';
import base64url from 'base64url';
import { AuthenticationChain, AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GenericAuthenticationMethodSelectionComponent } from "../../authentication/authenticationComponentTemplates/GenericAuthenticationMethodSelectionComponent";
import { GenericVIDAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericVIDAuthenticationComponent";
import { InspectPersonalInfoComponent } from "../authentication/InspectPersonalInfoComponent";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";
import { initializeCredentialEngine } from "../../lib/initializeCredentialEngine";


const datasetName = "diploma-dataset.xlsx";


parseDiplomaData(path.join(__dirname, `../../../../dataset/${datasetName}`));


export class EdiplomasBlueprintSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getAuthenticationChain(): AuthenticationChain {
		return new AuthenticationChainBuilder()
			.addAuthenticationComponent(new GenericAuthenticationMethodSelectionComponent(this.getScope() + "-auth-method", CONSENT_ENTRYPOINT, [{ code: UserAuthenticationMethod.VID_AUTH, description: "Authentication with PID" }, { code: UserAuthenticationMethod.SSO, description: "Authentication with National Services" }]))
			.addAuthenticationComponent(new GenericVIDAuthenticationComponent(this.getScope() + "-vid-auth", CONSENT_ENTRYPOINT, {
				"document_number": { input_descriptor_constraint_field_name: "Document Number", parser: (val: any) => String(val) },
			}, "PidWithDocumentNumber", "PID"))
			.addAuthenticationComponent(new GenericLocalAuthenticationComponent(this.getScope() + "-1-local", CONSENT_ENTRYPOINT, {
				"document_number": { datasetColumnName: "vid_document_number", parser: (val: any) => String(val) },
			},
				async () => parseDiplomaData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
				[{ username: "john", password: "secret" }, { username: "emily", password: "secret" }]
			))
			.addAuthenticationComponent(new InspectPersonalInfoComponent(this.getScope() + "-2-info", CONSENT_ENTRYPOINT))
			.build();
		// .addAuthenticationComponent(new LocalAuthenticationComponent2("2-local", CONSENT_ENTRYPOINT))
	}

	getId(): string {
		return "urn:credential:diploma";
	}
	getScope(): string {
		return "diploma";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SDJWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "Bachelor", this.getId()];
	}
	getDisplay() {
		return {
			name: "Bachelor Diploma",
			description: "This is a Bachelor Diploma verifiable credential",
			background_image: { uri: config.url + "/images/background-image.png" },
			background_color: "#003476",
			text_color: "#FFFFFF",
			locale: 'en-US',
		}
	}


	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.document_number) {
			console.log("Cannot generate credential: (document_number) is missing");
			return null;
		}


		const diplomaEntries = parseDiplomaData(path.join(__dirname, "../../../../dataset/diploma-dataset.xlsx"));
		if (!diplomaEntries || diplomaEntries.length == 0) {
			throw new Error("No diploma entries found");
		}
		const diplomaEntry = diplomaEntries.filter((diploma) =>
			String(diploma.vid_document_number) == userSession.document_number
		)[0];

		console.log("Diploma entry = ", diplomaEntry)
		if (!diplomaEntry) {
			console.error("Possibly raw data not found")
			throw new Error("Could not generate credential response");
		}

		const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template-diploma.svg"), 'utf-8');

		const rows: CategorizedRawCredentialViewRow[] = [
			{ name: "Given Name", value: diplomaEntry.given_name },
			{ name: "Family Name", value: diplomaEntry.family_name },
			{ name: "Title", value: diplomaEntry.title },
			{ name: "Grade", value: diplomaEntry.grade },
			{ name: "Graduation Date", value: formatDateDDMMYYYY(diplomaEntry.graduation_date) },
			{ name: "Blueprint ID", value: "#" + diplomaEntry.blueprint_id },
			{ name: "Expiry Date", value: formatDateDDMMYYYY(diplomaEntry.expiry_date) },
		];
		const rowsObject: CategorizedRawCredentialView = { rows };

		const { credentialRendering } = initializeCredentialEngine();
		const dataUri = await credentialRendering.renderSvgTemplate({
			json: { ...diplomaEntry },
			credentialImageSvgTemplate: svgText,
			sdJwtVcMetadataClaims: this.metadata().claims,
		});
		console.log("Data uri = ", dataUri);
		if (!dataUri) {
			throw new Error("Could not render svg");
		}
		const credentialView = {
			credential_id: diplomaEntry.certificateId,
			credential_supported_object: this.exportCredentialSupportedObject(),
			view: rowsObject,
			credential_image: dataUri,
		};
		return credentialView;
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, request: Request, holderPublicKeyJwk: JWK): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession?.document_number) {
			throw new Error("Cannot generate credential: (document_number) is missing");
		}

		const diplomaEntries = parseDiplomaData(path.join(__dirname, "../../../../dataset/diploma-dataset.xlsx"));
		if (!diplomaEntries || diplomaEntries.length == 0) {
			throw new Error("No diploma entries found");
		}
		const diplomaEntry = diplomaEntries.filter((diploma) =>
			String(diploma.vid_document_number) == userSession.document_number
		)[0];

		if (!diplomaEntry) {
			console.error("diplomaEntry not found")
			throw new Error("Could not generate credential response");
		}

		if (request.body?.vct != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
			console.log("Not the correct credential");
			throw new Error("Not the correct credential");
		}

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:credential:diploma:${randomUUID()}`,
			"family_name": diplomaEntry.family_name,
			"given_name": diplomaEntry.given_name,
			"title": diplomaEntry.title,
			"grade": String(diplomaEntry.grade),
			"eqf_level": String(diplomaEntry.eqf_level),
			"graduation_date": new Date(diplomaEntry.graduation_date).toISOString(),
			"expiry_date": new Date(diplomaEntry.expiry_date).toISOString(),
		};

		const disclosureFrame = {
			family_name: true,
			given_name: true,
			title: true,
			grade: true,
			eqf_level: false, // no ability to hide
			graduation_date: true,
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
			"name": "Diploma Credential",
			"description": "This is a Bachelor Diploma verifiable credential",
			"display": [
				{
					"lang": "en-US",
					"name": "Diploma Credential",
					"rendering": {
						"simple": {
							"logo": {
								"uri": config.url + "/images/logo.png",
								"uri#integrity": "sha256-c7fbfe45428aa2715f01065d812c9f6fd52f99c02e4018fb5761a7cbf4894257",
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
							"lang": "en-US",
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
							"lang": "en-US",
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
							"lang": "en-US",
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
							"lang": "en-US",
							"label": "Grade",
							"description": "Graduate's grade (0-10)"
						}
					],
				},
				{
					"path": ["eqf_level"],
					"display": [
						{
							"lang": "en-US",
							"label": "EQF Level",
							"description": "The EQF level of the diploma according to https://europass.europa.eu/en/description-eight-eqf-levels"
						}
					],
				},
				{
					"path": ["graduation_date"],
					"display": [
						{
							"lang": "en-US",
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

