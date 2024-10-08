import { config } from "../../../config";
import { VerifiableCredentialFormat } from "../../types/oid4vci";
import { VCDMSupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { issuerSigner } from "../issuerSigner";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import { parseDiplomaData } from "../datasetParser";
import path from "path";
import { randomUUID } from "crypto";
import { Request } from "express";


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

		const credentialView: CredentialView = {
			credential_id: diplomaEntry.certificateId,
			deferredFlow: false,
			credential_supported_object: this.exportCredentialSupportedObject(),
			view: {
				rows: [
					{ name: "Given Name", value: diplomaEntry.given_name },
					{ name: "Family Name", value: diplomaEntry.family_name },
					{ name: "Title", value: diplomaEntry.title },
					{ name: "Grade", value: diplomaEntry.grade },
					{ name: "Graduation date", value: diplomaEntry.graduation_date },
					{ name: "Blueprint ID", value: "#" + diplomaEntry.blueprint_id  },

				]
			}
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
			"title": diplomaEntry.title,
			"grade": String(diplomaEntry.grade),
			"eqf_level": String(diplomaEntry.eqf_level),
			"graduation_date": diplomaEntry.graduation_date,
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

