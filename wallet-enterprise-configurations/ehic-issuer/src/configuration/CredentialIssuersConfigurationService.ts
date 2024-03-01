import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { CredentialIssuersConfiguration, CredentialSigner } from "../services/interfaces";
import { PDA1SupportedCredentialJwtVcJson } from "./SupportedCredentialsConfiguration/PDA1SupportedCredentialJwtVcJson";
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
				issuer: did,
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


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const pda1Issuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setSigner(issuerSigner)
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// pda1Issuer.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(pda1Issuer));
		// pda1Issuer.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(pda1Issuer));
		// pda1Issuer.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(pda1Issuer));
		pda1Issuer.addSupportedCredential(new PDA1SupportedCredentialJwtVcJson(pda1Issuer));

		// const pda1Issuer2 = new CredentialIssuer()
		// 	.setCredentialIssuerIdentifier(config.url + "/vid")
		// 	.setWalletId("conformant")
		// 	.setAuthorizationServerURL(config.url)
		// 	.setCredentialEndpoint(config.url + "/vid/openid4vci/credential")
		// 	// .setDeferredCredentialEndpoint(config.url + "/vid/openid4vci/deferred");
		// pda1Issuer2.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(pda1Issuer2));
		// pda1Issuer2.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(pda1Issuer2));
		// pda1Issuer2.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(pda1Issuer2));
	
		return new CredentialIssuersRepository([
			pda1Issuer,
			// pda1Issuer2
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

	public defaultCredentialIssuerIdentifier(): string {
		return config.url;
	}
}