import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { CredentialIssuersConfiguration, CredentialSigner } from "../services/interfaces";
import { VIDSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialSdJwt";
import { importJWK } from "jose";
import fs from 'fs';
import path from "path";
import { KeyIdentifierKeySchema } from "../lib/Identifier";
import { util } from "@cef-ebsi/key-did-resolver";
import { HasherAlgorithm, HasherAndAlgorithm, SdJwt, SignatureAndEncryptionAlgorithm, Signer } from "@sd-jwt/core";
import { sign, randomBytes, createHash, KeyLike } from "crypto";

const issuerKeySetFile = fs.readFileSync(path.join(__dirname, '../../../keys/issuer.key.json'), 'utf-8');
const issuerKeySet = KeyIdentifierKeySchema.parse(JSON.parse(issuerKeySetFile));


const issuerSigner: CredentialSigner = {
	sign: async function (payload, headers, disclosureFrame) {
		const key = await importJWK(issuerKeySet.keys['ES256']?.privateKeyJwk, 'ES256');

		const signer: Signer = (input, header) => {
			if (header.alg !== SignatureAndEncryptionAlgorithm.ES256) {
					throw new Error('only ES256 is supported')
			}
			return sign(null, Buffer.from(input), key as KeyLike)
		}
		
		const saltGenerator = () => {
			const buffer = randomBytes(16);
			return buffer.toString('base64')
									.replace(/\+/g, '-')
									.replace(/\//g, '_')
									.replace(/=/g, '');
		};

		const hasherAndAlgorithm: HasherAndAlgorithm = {
			hasher: (input: string) => createHash('sha256').update(input).digest(),
			algorithm: HasherAlgorithm.Sha256
		}

		const { did } = await this.getDID();
		const kid = `${did}#${did.split(':')[2]}`;

		const issuanceDate = new Date();
		const expirationDate = (() => {
			const expirationDate = new Date(payload.vc.credentialSubject.validityPeriod.endingDate);
			return expirationDate;
		})();

		payload.vc.expirationDate = expirationDate.toISOString();
		payload.exp = Math.floor(expirationDate.getTime() / 1000);

		payload.vc.issuanceDate = issuanceDate.toISOString();
		payload.iat = Math.floor(issuanceDate.getTime() / 1000);

		payload.iss = did;
		payload.vc.issuer = did;

		payload.sub = payload.vc.credentialSubject.id;
		
		if (disclosureFrame != undefined) {
			const sdJwt = new SdJwt({
				header: { ...headers, alg: SignatureAndEncryptionAlgorithm.ES256, kid },
				payload
			}).withHasher(hasherAndAlgorithm)
				.withSigner(signer)
				.withSaltGenerator(saltGenerator)
				.withDisclosureFrame(disclosureFrame);
			return { jws: await sdJwt.toCompact() };
		}
		else {
			throw new Error("Could not generate signature");
		}

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
		vidIssuer.addSupportedCredential(new VIDSupportedCredentialSdJwt(vidIssuer));

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