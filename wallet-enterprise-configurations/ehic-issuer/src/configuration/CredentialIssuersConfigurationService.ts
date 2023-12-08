import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { CredentialIssuersConfiguration, Signer } from "../services/interfaces";
import { EHICSupportedCredentialJwtVcJson } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialJwtVcJson";
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


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		const ehicIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setSigner(issuerSigner)
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// ehicIssuer.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(ehicIssuer));
		// ehicIssuer.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(ehicIssuer));
		// ehicIssuer.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(ehicIssuer));
		ehicIssuer.addSupportedCredential(new EHICSupportedCredentialJwtVcJson(ehicIssuer));

		// const ehicIssuer2 = new CredentialIssuer()
		// 	.setCredentialIssuerIdentifier(config.url + "/vid")
		// 	.setWalletId("conformant")
		// 	.setAuthorizationServerURL(config.url)
		// 	.setCredentialEndpoint(config.url + "/vid/openid4vci/credential")
		// 	// .setDeferredCredentialEndpoint(config.url + "/vid/openid4vci/deferred");
		// ehicIssuer2.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(ehicIssuer2));
		// ehicIssuer2.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(ehicIssuer2));
		// ehicIssuer2.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(ehicIssuer2));
	
		return new CredentialIssuersRepository([
			ehicIssuer,
			// ehicIssuer2
		]);
	}

	public registeredClients(): { client_id: string; friendlyName: string; redirectUri: string; }[] {
		return [];
	}

	public defaultCredentialIssuerIdentifier(): string {
		return config.url;
	}
}