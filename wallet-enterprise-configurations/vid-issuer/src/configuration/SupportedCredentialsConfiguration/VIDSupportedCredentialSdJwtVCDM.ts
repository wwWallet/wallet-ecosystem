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
import { issuerSigner } from "../issuerSigner";
import { parsePidData } from "../datasetParser";
import path from "node:path";
import fs from 'fs';

parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx")) // test parse

export class VIDSupportedCredentialSdJwtVCDM implements VCDMSupportedCredentialProtocol {


	constructor() { }

	getScope(): string {
		return "vid";
	}

	getCredentialSigner(): CredentialSigner {
		return issuerSigner;
	}

	getId(): string {
		return "urn:credential:vid"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "VerifiableId", this.getId()];
	}

	getDisplay() {
		return {
			name: "Verifiable ID",
			description: "This is a Verifiable ID verifiable credential issued by the well-known VID Issuer",
			background_image: { uri: config.url + "/images/card.png" },
			background_color: "#4CC3DD",
			locale: 'en-US',
		}
	}

	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.pid_id) {
			return null;
		}
		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));

		if (!users) {
			console.error("Failed to load users")
			return null;
		}

		const svgText = fs.readFileSync(path.join(__dirname, "../../../../public/images/template.svg"), 'utf-8');
		const vids = users.filter(u => String(u.pid_id) == userSession?.pid_id);
		const credentialViews: CredentialView[] = vids
			.map((vid) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: vid.family_name },
					{ name: "Given Name", value: vid.given_name },
					{ name: "Document Number", value: vid.document_number },
					{ name: "Birth Date", value: formatDateDDMMYYYY(vid.birth_date) },
					{ name: "Expiry Date", value: formatDateDDMMYYYY(vid.expiry_date) },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				const pathsWithValues = [
					{ path: "family_name", value: vid.family_name },
					{ path: "given_name", value: vid.given_name },
					{ path: "document_number", value: vid.document_number },
					{ path: "birth_date", value: formatDateDDMMYYYY(vid.birth_date) },
					{ path: "expiry_date", value: formatDateDDMMYYYY(vid.expiry_date) }
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

	async generateCredentialResponse(userSession: AuthorizationServerState, request: Request, holderPublicKeyJwk: JWK): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession?.pid_id) {
			console.log("Cannot generate credential: pid_id is missing")
			throw new Error("Cannot generate credential: pid_id is missing");
		}

		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));

		if (!users) {
			throw new Error("Failed to get users from dataset");
		}

		if (request.body?.vct != this.getId() || !userSession.scope || !userSession.scope.split(' ').includes(this.getScope())) {
			console.log("Not the correct credential");
			throw new Error("Not the correct credential");
		}

		const vidEntry = users?.filter(u => String(u.pid_id) == userSession.pid_id)[0];
		if (!vidEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}

		const vid = {
			family_name: vidEntry.family_name,
			given_name: vidEntry.given_name,
			birth_date: new Date(vidEntry.birth_date).toISOString(),
			issuing_authority: vidEntry.issuing_authority,
			issuing_country: vidEntry.issuing_country,
			document_number: String(vidEntry.document_number),
			issuance_date: new Date().toISOString(),
			expiry_date: new Date(vidEntry.expiry_date).toISOString(),
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:vid:${randomUUID()}`,
			...vid,
		};

		const disclosureFrame = {
			family_name: true,
			given_name: true,
			birth_date: true,
			issuing_authority: true,
			issuing_country: true,
			document_number: true,
			issuance_date: true,
			expiry_date: true,
		}
		const { jws } = await this.getCredentialSigner()
			.sign(payload, { typ: 'JWT', vctm: this.metadata() }, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: jws
		};

		return response;
	}

	public metadata(): any {
		return {
			"vct": this.getId(),
			"name": "Verifiable ID",
			"description": "This is a Verifiable ID document issued by the well known VID Issuer",
			"display": [
				{
					"en-US": {
						"name": "Verifiable ID",
						"rendering": {
							"simple": {
								"logo": {
									"uri": config.url + "/images/card.png",
									"uri#integrity": "sha256-acda3404c2cf46da192cf245ccc6b91edce8869122fa5a6636284f1a60ffcd86",
									"alt_text": "VID Card"
								},
								"background_color": "#12107c",
								"text_color": "#FFFFFF"
							},
							"svg_templates": [
								{
									"uri": config.url + "/images/template.svg",
								}
							],
						}
					}
				}
			],
			"claims": [
				{
					"path": ["given_name"],
					"display": {
						"en-US": {
							"label": "Given Name",
							"description": "The given name of the VID holder"
						}
					},
					"verification": "verified",
					"sd": "allowed",
					"svg_id": "given_name"
				},
				{
					"path": ["family_name"],
					"display": {
						"en-US": {
							"label": "Family Name",
							"description": "The family name of the VID holder"
						}
					},
					"verification": "verified",
					"sd": "allowed",
					"svg_id": "family_name"
				},
				{
					"path": ["birth_date"],
					"display": {
						"en-US": {
							"label": "Birth Date",
							"description": "The birth date of the VID holder"
						}
					},
					"verification": "verified",
					"sd": "allowed",
					"svg_id": "birth_date"
				},
				{
					"path": ["issuing_authority"],
					"display": {
						"en-US": {
							"label": "Issuing Authority",
							"description": "The country code of the authority that issued this credential"
						}
					},
					"verification": "authoritative",
					"sd": "allowed",
					"svg_id": "issuing_authority"
				},
				{
					"path": ["issuance_date"],
					"display": {
						"en-US": {
							"label": "Issuance Date",
							"description": "The date and time issued this credential"
						}
					},
					"verification": "authoritative",
					"sd": "allowed",
					"svg_id": "issuance_date"
				},
				{
					"path": ["expiry_date"],
					"display": {
						"en-US": {
							"label": "Expiry Date",
							"description": "The date and time expired this credential"
						}
					},
					"verification": "authoritative",
					"sd": "allowed",
					"svg_id": "expiry_date"
				}
			],
			"schema": {
				"$schema": "http://json-schema.org/draft-07/schema#",
				"type": "object",
				"properties": {
					"given_name": {
						"type": "string"
					},
					"family_name": {
						"type": "string"
					},
					"birth_date": {
						"type": "string",
					},
					"issuing_authority": {
						"type": "string"
					},
					"issuance_date": {
						"type": "string"
					},
					"expiry_date": {
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
