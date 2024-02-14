import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { CredentialIssuersConfiguration, CredentialSigner } from "../services/interfaces";
import { VIDSupportedCredentialJwtVcJson } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialJwtVcJson";
import { JWTHeaderParameters, SignJWT, importJWK } from "jose";
import fs from 'fs';
import path from "path";
import { KeyIdentifierKeySchema } from "../lib/Identifier";
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
		const vidIssuer = new CredentialIssuer()
			.setCredentialIssuerIdentifier(config.url)
			.setSigner(issuerSigner)
			.setAuthorizationServerURL(config.url)
			.setCredentialEndpoint(config.url + "/openid4vci/credential")
			// .setDeferredCredentialEndpoint(config.url + "/openid4vci/deferred")

		// vidIssuer.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(vidIssuer));
		// vidIssuer.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(vidIssuer));
		// vidIssuer.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(vidIssuer));
		vidIssuer.addSupportedCredential(new VIDSupportedCredentialJwtVcJson(vidIssuer));

		// const vidIssuer2 = new CredentialIssuer()
		// 	.setCredentialIssuerIdentifier(config.url + "/vid")
		// 	.setWalletId("conformant")
		// 	.setAuthorizationServerURL(config.url)
		// 	.setCredentialEndpoint(config.url + "/vid/openid4vci/credential")
		// 	// .setDeferredCredentialEndpoint(config.url + "/vid/openid4vci/deferred");
		// vidIssuer2.addSupportedCredential(new CTWalletSameInTimeSupportedCredential(vidIssuer2));
		// vidIssuer2.addSupportedCredential(new CTWalletSameDeferredSupportedCredential(vidIssuer2));
		// vidIssuer2.addSupportedCredential(new CTWalletSamePreAuthorisedSupportedCredential(vidIssuer2));
	
		return new CredentialIssuersRepository([
			vidIssuer,
			// vidIssuer2
		]);
	}

	public registeredClients(): { client_id: string; friendlyName: string; redirectUri: string; }[] {
		return [];
	}

	public defaultCredentialIssuerIdentifier(): string {
		return config.url;
	}
}