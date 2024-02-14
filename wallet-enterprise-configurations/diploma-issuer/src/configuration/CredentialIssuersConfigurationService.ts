import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprint } from "./SupportedCredentialsConfiguration/EdiplomasBlueprint";
import { CredentialIssuersConfiguration, CredentialSigner } from "../services/interfaces";
import { SignJWT, JWTHeaderParameters, importJWK } from "jose";
import path from "node:path";
import { KeyIdentifierKeySchema } from "../lib/Identifier";
import fs from 'fs';
import { util } from "@cef-ebsi/key-did-resolver";

const issuerKeySetFile = fs.readFileSync(path.join(__dirname, '../../../keys/issuer.key.json'), 'utf-8');
const issuerKeySet = KeyIdentifierKeySchema.parse(JSON.parse(issuerKeySetFile));

const issuerSigner: CredentialSigner = {
	sign: async function (payload: any, headers: JWTHeaderParameters) {
		const { did } = await this.getDID();
		const key = await importJWK(issuerKeySet.keys['ES256']?.privateKeyJwk, 'ES256');
		const kid = `${did}#${did.split(':')[2]}`;

		const extendedHeaders = { ...headers, alg: 'ES256', kid: kid };

		const issuanceDate = new Date();
		const expirationDate = (() => {
			const expirationDate = new Date(issuanceDate);
			expirationDate.setFullYear(expirationDate.getFullYear() + 1);
			return expirationDate;
		})();

		const extendedPayload = {
			iss: did,
			vc: {
				...payload, // this includes the credential subject, the types and the LD context
				issuanceDate: issuanceDate.toISOString(),
				expirationDate: expirationDate.toISOString(),
				issuer: {
					id: did,
					name: "University of Athens",
					iconUrl: `${config.url}/images/uoa.svg`,
					image: `${config.url}/images/uoa.svg`,
					logoUrl: `${config.url}/images/uoa.svg`
				},
			},
			iat: Math.floor(issuanceDate.getTime() / 1000),
			exp: Math.floor(expirationDate.getTime() / 1000),
			sub: payload.credentialSubject.id,
		};
		const jws = await new SignJWT(extendedPayload)
			.setProtectedHeader(extendedHeaders)
			.sign(key);
		return { jws };
	},
	getPublicKeyJwk: async function () {
		const jwk = issuerKeySet.keys['ES256']?.publicKeyJwk;
		return { jwk: jwk };
	},
	getDID: async function () {
		const did = util.createDid(issuerKeySet.keys['ES256']?.publicKeyJwk);
		return { did: did };
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