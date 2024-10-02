import { config } from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display } from "../../types/oid4vci";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import { Request } from "express";
import { issuerSigner } from "../CredentialIssuerConfiguration";
import { parsePidData } from "../datasetParser";
import path from "node:path";


parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx")) // test parse

export class VIDSupportedCredentialSdJwt implements SupportedCredentialProtocol {


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
	getDisplay(): Display {
		return {
			name: "Verifiable ID",
			description: "This is a Verifiable ID verifiable credential issued by the well-known VID Issuer",
			background_image: { uri: config.url + "/images/vidCard.png" },
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

		const vids = users.filter(u => String(u.pid_id) == userSession?.pid_id);
		const credentialViews: CredentialView[] = vids
			.map((vid) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: vid.family_name },
					{ name: "Given Name", value: vid.given_name },
					{ name: "Document number", value: vid.document_number },
					{ name: "Date of Birth", value: vid.birth_date },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				return {
					credential_id: this.getId(),
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					deferredFlow: false,
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
			birth_date: vidEntry.birth_date,
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
		}
		const { jws } = await this.getCredentialSigner()
			.sign(payload, {}, disclosureFrame);
		const response = {
			format: this.getFormat(),
			credential: jws
		};

		return response;
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
