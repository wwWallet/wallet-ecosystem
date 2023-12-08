import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprint } from "./SupportedCredentialsConfiguration/EdiplomasBlueprint";
import { CredentialIssuersConfiguration, Signer } from "../services/interfaces";
import { SignVerifiableCredentialJWT } from "@wwwallet/ssi-sdk";
import { SignJWT, JWTHeaderParameters, importJWK } from "jose";
import path from "node:path";
import { KeyIdentifierKeySchema } from "../lib/Identifier";
import fs from 'fs';

const issuerKeySetFile = fs.readFileSync(path.join(__dirname, '../../../keys/issuer.w3c.json'), 'utf-8');
const issuerKeySet = KeyIdentifierKeySchema.parse(JSON.parse(issuerKeySetFile));

const issuerSigner: Signer = {
	sign: async function (signJwt: SignJWT | SignVerifiableCredentialJWT, headers: JWTHeaderParameters) {
		const { did } = await this.getDID();
		const key = await importJWK(issuerKeySet.keys['ES256']?.privateKeyJwk, 'ES256');
		const jws = await signJwt
			.setProtectedHeader({ ...headers, alg: 'ES256', kid: issuerKeySet.keys['ES256']?.kid ?? "undefined" })
			.setIssuer(did)
			.sign(key);
		return { jws };
	},
	getPublicKeyJwk: async function () {
		return { jwk: issuerKeySet.keys['ES256']?.publicKeyJwk ?? "undefined" };
	},
	getDID: async function () {
		return { did: issuerKeySet.keys['ES256']?.kid.split('#')[0] ?? "undefined" };
	}
}

@injectable()
export class CredentialIssuersConfigurationService implements CredentialIssuersConfiguration {

	readonly credentialIssuerIdentifierUOA = config.url + "/uoa";

	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const diplomaIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(this.credentialIssuerIdentifierUOA)
			.setSigner(issuerSigner)
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(this.credentialIssuerIdentifierUOA + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// diplomaIssuer.addSupportedCredential(new EdiplomasBlueprint(diplomaIssuer, "75"));
		diplomaIssuer.addSupportedCredential(new EdiplomasBlueprint(diplomaIssuer, "46"));

		return new CredentialIssuersRepository([
			diplomaIssuer
		]);
	}

	public registeredClients(): { client_id: string; friendlyName: string; redirectUri: string; }[] {
		const openidGenericClient = {
			client_id: "123",
			friendlyName: "Agnostic Client",
			redirectUri: "openid://cb"
		};

		const localWWWalletClient = {
			client_id: "343242",
			friendlyName: "Dev wwwWallet Client",
			redirectUri: "http://localhost:3000/cb"
		};

		const deployedWWWalletClient = {
			client_id: "1232132131232131",
			friendlyName: "wwwWallet",
			redirectUri: "https://demo.wwwallet.org/cb"
		};
		return [
			openidGenericClient,
			localWWWalletClient,
			deployedWWWalletClient
		]
	}

	public defaultCredentialIssuerIdentifier(): string | null {
		return null;
	}
}