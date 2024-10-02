import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display } from "../../types/oid4vci";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { randomUUID } from "node:crypto";
import { CredentialSigner } from "../../services/interfaces";
import { JWK } from "jose";
import { Request } from "express";
import { parseEhicData } from "../datasetParser";
import path from "node:path";
import { issuerSigner } from "../CredentialIssuerConfiguration";


parseEhicData(path.join(__dirname, "../../../../dataset/ehic-dataset.xlsx")) // test parse

export class EHICSupportedCredentialSdJwt implements SupportedCredentialProtocol {


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
	getDisplay(): Display {
		return {
			name: "EHIC",
			description: "This is a European Health Insurance Card verifiable credential issued by the well-known EHIC Issuer",
			background_image: { uri: config.url + "/images/ehicCard.png" },
			background_color: "#4CC3DD",
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

		const ehics = users.filter((ehic) => 
			ehic.family_name == userSession.family_name &&
			ehic.given_name == userSession.given_name &&
			new Date(ehic.birth_date).toISOString() == new Date(userSession.birth_date as string).toISOString()
		);
		console.log("Ehic = ", ehics)
		const credentialViews: CredentialView[] = ehics
			.map((ehic) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: ehic.family_name },
					{ name: "Given Name", value: ehic.given_name },
					{ name: "SSN", value: String(ehic.ssn) },
					{ name: "Date of Birth", value: ehic.birth_date },
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
			ssn: ehicEntry.ssn,
			birth_date: ehicEntry.birth_date
		};

		const payload = {
			"cnf": {
				"jwk": holderPublicKeyJwk
			},
			"vct": this.getId(),
			"jti": `urn:ehic:${randomUUID()}`,
			...ehic,
			ssn: String(ehic.ssn)
		};

		const disclosureFrame = {
			family_name: true,
			given_name: true,
			birth_date: true,
			ssn: true,
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
