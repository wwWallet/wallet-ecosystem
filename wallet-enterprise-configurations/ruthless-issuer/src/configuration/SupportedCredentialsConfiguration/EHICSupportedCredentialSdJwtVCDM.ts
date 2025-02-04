import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat } from "../../types/oid4vci";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { formatDateDDMMYYYY } from "../../lib/formatDate";
import { generateDataUriFromSvg } from "../../lib/generateDataUriFromSvg";
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

parseEhicData(path.join(__dirname, "../../../../dataset/ehic-dataset.xlsx")) // test parse

export class EHICSupportedCredentialSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getScope(): string {
		return "ehic";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:credential:ehic"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "EuropeanHealthInsuranceCard", this.getId()];
	}
	getDisplay() {
		return {
			name: "EHIC",
			description: "This is a European Health Insurance Card verifiable credential",
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
			const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template.svg"), 'utf-8');
			const credentialViews: CredentialView[] = ehics
				.map((ehic) => {
					const rows: CategorizedRawCredentialViewRow[] = [
						{ name: "Family Name", value: ehic.family_name },
						{ name: "Given Name", value: ehic.given_name },
						{ name: "SSN", value: String(ehic.ssn) },
						{ name: "Birth Date", value: formatDateDDMMYYYY(ehic.birth_date) },
						{ name: "Issuer Country", value: ehic.issuer_country },
						{ name: "Issuer Instutution Code", value: ehic.issuer_institution_code },

					];
					const rowsObject: CategorizedRawCredentialView = { rows };
					const pathsWithValues = [
						{ path: "family_name", value: ehic.family_name },
						{ path: "given_name", value: ehic.given_name },
						{ path: "ssn", value: String(ehic.ssn) },
						{ path: "birth_date", value: formatDateDDMMYYYY(ehic.birth_date) },
						{ path: "expiry_date", value: formatDateDDMMYYYY(ehic.expiry_date) },
						{ path: "issuer_country", value: String(ehic.issuer_country) },
						{ path: "issuer_institution_code", value: String(ehic.issuer_institution_code) },
					];
					const dataUri = generateDataUriFromSvg(svgText, pathsWithValues);

					return {
						credential_id: this.getId(),
						credential_supported_object: this.exportCredentialSupportedObject(),
						view: rowsObject,
						credential_image: dataUri,
					}
				})
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
			family_name: ehicEntry.family_name,
			given_name: ehicEntry.given_name,
			ssn: String(ehicEntry.ssn),
			birth_date: new Date(ehicEntry.birth_date).toISOString(),
			issuer_institution_code: String(ehicEntry.issuer_institution_code),
			issuer_country: String(ehicEntry.issuer_country),
			expiry_date: new Date(ehicEntry.expiry_date).toISOString(),
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:ehic:${randomUUID()}`,
			...ehic,
			ssn: String(ehic.ssn),
		};

		const disclosureFrame = {
			family_name: true,
			given_name: true,
			birth_date: true,
			ssn: true,
			issuer_institution_code: true,
			issuer_country: true,
		}
		const { jws } = await this.getCredentialSigner()
			.sign(payload, { typ: "vc+sd-jwt", vctm: [base64url.encode(JSON.stringify(this.metadata()))] }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: jws
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
								"uri": config.url + "/images/template.svg",
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
							"description": "The given name of the EHIC holder"
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
							"description": "The family name of the EHIC holder"
						}
					],
					"svg_id": "family_name"
				},
				{
					"path": ["birth_date"],
					"display": [
						{
							"lang": "en-US",
							"label": "Birth Date",
							"description": "The birth date of the EHIC holder"
						}
					],
					"svg_id": "birth_date"
				},
				{
					"path": ["ssn"],
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
					"path": ["issuer_country"],
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
					"path": ["issuer_institution_code"],
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
