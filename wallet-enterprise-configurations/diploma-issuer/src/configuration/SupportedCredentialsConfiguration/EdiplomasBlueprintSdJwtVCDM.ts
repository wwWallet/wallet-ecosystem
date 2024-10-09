import { config } from "../../../config";
import { VerifiableCredentialFormat } from "../../types/oid4vci";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { formatDateDDMMYYYY } from "../../lib/formatDate";
import { generateDataUriFromSvg } from "../../lib/generateDataUriFromSvg";
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

parseDiplomaData(path.join(__dirname, "../../../../dataset/diploma-dataset.xlsx"));

export class EdiplomasBlueprintSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }


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
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "Bachelor", this.getId()];
	}
	getDisplay() {
		return {
			name: "Bachelor Diploma",
			description: "This is a Bachelor Diploma verifiable credential issued by the well-known eDiplomas",
			background_image: { uri: config.url + "/images/EuropassUoaCard.png" },
			background_color: "#4CC3DD",
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
		if (!diplomaEntry) {
			console.error("Possibly raw data not found")
			throw new Error("Could not generate credential response");
		}

		const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/diplomaTemplate.svg"), 'utf-8');

		const credentialViews: CredentialView[] = diplomaEntries
			.map((diplomaEntry) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Given Name", value: diplomaEntry.given_name },
					{ name: "Family Name", value: diplomaEntry.family_name },
					{ name: "Title", value: diplomaEntry.title },
					{ name: "Grade", value: diplomaEntry.grade },
					{ name: "Graduation Date", value: formatDateDDMMYYYY(diplomaEntry.graduation_date) },
					{ name: "Blueprint ID", value: "#" + diplomaEntry.blueprint_id },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				const pathsWithValues = [
					{ path: "given_name", value: diplomaEntry.given_name },
					{ path: "family_name", value: diplomaEntry.family_name },
					{ path: "Title", value: diplomaEntry.title },
					{ path: "Grade", value: diplomaEntry.grade },
				];
				const dataUri = generateDataUriFromSvg(svgText, pathsWithValues);

				return {
					credential_id: diplomaEntry.certificateId,
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					credential_image: dataUri,
				}
			})
		return credentialViews[0];
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
			"graduation_date": new Date(diplomaEntry.graduation_date).toISOString()
		};

		const disclosureFrame = {
			title: true,
			grade: true,
			eqf_level: false, // no ability to hide
			graduation_date: true,
		}

		const { jws } = await this.getCredentialSigner()
			.sign(payload, { typ: "JWT", vctm: this.metadata() }, disclosureFrame);

		const response = {
			format: this.getFormat(),
			credential: jws
		};

		return response;
	}

	public metadata(): any {
		return {
			"vct": this.getId(),
			"name": "Diploma Credential",
			"description": "This is a Verifiable ID document issued by the well known VID Issuer",
			"display": [
				{
					"en-US": {
						"name": "Diploma Credential",
						"rendering": {
							"simple": {
								"logo": {
									"uri": config.url + "/images/EuropassUoaCard.png",
									"uri#integrity": "sha256-c7fbfe45428aa2715f01065d812c9f6fd52f99c02e4018fb5761a7cbf4894257",
									"alt_text": "Diploma Card"
								},
								"background_color": "#12107c",
								"text_color": "#FFFFFF"
							},
							"svg_templates": {
								"uri": config.url + "/images/diplomaTemplate.svg",
							},
						}
					}
				}
			],
			"claims": [
				{
					"path": ["title"],
					"display": {
						"en-US": {
							"label": "Diploma Title",
							"description": "The title of the Diploma"
						}
					},
					"verification": "verified",
					"sd": "allowed"
				},
				{
					"path": ["grade"],
					"display": {
						"en-US": {
							"label": "Grade",
							"description": "Graduate's grade (0-10)"
						}
					},
					"verification": "verified",
					"sd": "allowed"
				},
				{
					"path": ["eqf_level"],
					"display": {
						"en-US": {
							"label": "EQF Level",
							"description": "The EQF level of the diploma according to https://europass.europa.eu/en/description-eight-eqf-levels"
						}
					},
					"verification": "verified",
					"sd": "allowed"
				},
				{
					"path": ["graduation_date"],
					"display": {
						"en-US": {
							"label": "Graduation Date",
							"description": "The graduation data"
						}
					},
					"verification": "verified",
					"sd": "allowed"
				},
			],
			"schema": {
				"$schema": "http://json-schema.org/draft-07/schema#",
				"type": "object",
				"properties": {
					"title": {
						"type": "string"
					},
					"grade": {
						"type": "string"
					},
					"eqf_level": {
						"type": "string",
					},
					"graduation_date": {
						"type": "string"
					}
				},
				"required": [],
				"additionalProperties": true
			}
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

