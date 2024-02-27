import { injectable } from "inversify";
import 'reflect-metadata';
import config from "../../config";
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";
import { CredentialIssuer } from "../lib/CredentialIssuerConfig/CredentialIssuer";
import { EdiplomasBlueprintSdJwt } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwt";
import { CredentialIssuersConfiguration, CredentialSigner } from "../services/interfaces";
import { importJWK } from "jose";
import path from "node:path";
import { KeyIdentifierKeySchema } from "../lib/Identifier";
import fs from 'fs';
import { util } from "@cef-ebsi/key-did-resolver";
import { HasherAlgorithm, HasherAndAlgorithm, SdJwt, SignatureAndEncryptionAlgorithm, Signer } from "@sd-jwt/core";
import { KeyLike, createHash, randomBytes, sign } from "crypto";

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
			const expirationDate = new Date(issuanceDate);
			expirationDate.setFullYear(expirationDate.getFullYear() + 1);
			return expirationDate;
		})();

		payload.vc.expirationDate = expirationDate.toISOString();
		payload.exp = Math.floor(expirationDate.getTime() / 1000);

		payload.vc.issuanceDate = issuanceDate.toISOString();
		payload.iat = Math.floor(issuanceDate.getTime() / 1000);

		payload.iss = did;
		payload.sub = payload.vc.credentialSubject.id;

		const sdJwt = new SdJwt({
			header: { ...headers, alg: SignatureAndEncryptionAlgorithm.ES256, kid },
			payload
		}).withHasher(hasherAndAlgorithm)
			.withSigner(signer)
			.withSaltGenerator(saltGenerator)
			.withDisclosureFrame(disclosureFrame);

		const credential =  await sdJwt.toCompact();
		console.log("jws = ", credential)

		return { jws: credential };
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
		diplomaIssuer.addSupportedCredential(new EdiplomasBlueprintSdJwt(diplomaIssuer, "46"));

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