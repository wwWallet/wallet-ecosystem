import 'reflect-metadata';
import { config } from "../../config";
import { CredentialSigner } from "../services/interfaces";
import fs from 'fs';
import path from "path";
import { HasherAlgorithm, HasherAndAlgorithm, SdJwt, SignatureAndEncryptionAlgorithm, Signer } from "@sd-jwt/core";
import { sign, randomBytes, KeyObject, createHash } from "crypto";
import { importPrivateKeyPem } from '../lib/importPrivateKeyPem';
import { base64url, calculateJwkThumbprint, exportJWK, importX509 } from 'jose';
import { Document } from '@auth0/mdl';
import { cborEncode } from "@auth0/mdl/lib/cbor";
import { SupportedAlgs } from '@auth0/mdl/lib/mdoc/model/types';
// @ts-ignore
const keyAlgorithm = config?.keyAlgorithm ?? "ES256";

const issuerX5C: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../keys/x5c.json"), 'utf-8').toString()) as string[];
const issuerPrivateKeyPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.key"), 'utf-8').toString();
const issuerCertPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.crt"), 'utf-8').toString() as string;;
// const caCertPem = fs.readFileSync(path.join(__dirname, "../../../keys/ca.crt"), 'utf-8').toString() as string;;

importPrivateKeyPem(issuerPrivateKeyPem, keyAlgorithm) // attempt to import the key
importX509(issuerCertPem, keyAlgorithm); // attempt to import the public key

const issuerJwkKid = "8636af04-5796-4f46-a73e-d690d7d4e7f3";

export const issuerSigner: CredentialSigner = {
	signMsoMdoc: async function (doctype, namespaces, holderPublicKeyJwk) {

		const key = await importPrivateKeyPem(issuerPrivateKeyPem, keyAlgorithm);
		if (!key) {
			throw new Error("Could not import private key");
		}
		const document = new Document(doctype)
		for (const [ns, nsData] of namespaces) {
			document.addIssuerNameSpace(ns, { ...nsData })
		}
		console.log("Cert = ", importX509(issuerCertPem, keyAlgorithm))

		const issuerPrivateKeyJwk = await exportJWK(key);
		const validFromDate = new Date();
		validFromDate.setDate(validFromDate.getDay() - 10);
		const expirationDate = new Date();

		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const signedDocument = await document
			.addValidityInfo({
				signed: new Date(),
				validUntil: expirationDate,
				validFrom: validFromDate,
			})
			.addDeviceKeyInfo({ deviceKey: holderPublicKeyJwk })
			.sign({
				issuerPrivateKey: {
					...issuerPrivateKeyJwk,
					kid: issuerJwkKid, // only used to avoid undefined value on kid of the IssuerAuth
				},
				issuerCertificate: issuerCertPem,
				alg: keyAlgorithm as SupportedAlgs,
			});

		// await signedDocument.issuerSigned.issuerAuth.verifyX509([caCertPem])

		const prepared = signedDocument.prepare();
		const issuerSigned = prepared.get('issuerSigned');
		console.log("Issuer signed = ", issuerSigned)
		const issuedSignedCborEncoded = cborEncode(issuerSigned);
		const credential = base64url.encode(issuedSignedCborEncoded);
		return { credential: credential };

	},
	signSdJwtVc: async function (payload, headers, disclosureFrame) {
		const key = await importPrivateKeyPem(issuerPrivateKeyPem, keyAlgorithm);
		if (!key) {
			throw new Error("Could not import private key");
		}

		const hasherAndAlgorithm = (keyAlgorithm: string): HasherAndAlgorithm => {

			let hasherAlg: HasherAlgorithm | null = null;
			switch (keyAlgorithm) {
				case "ES256":
					hasherAlg = HasherAlgorithm.Sha256;
					break;
				case "ES512":
					hasherAlg = HasherAlgorithm.Sha512;
					break;
				default:
					throw new Error("not supported algorithm");
			}
			if (hasherAlg == null) {
				throw new Error("not supported algorithm");
			}
			const hasherAndAlgorithm: HasherAndAlgorithm = {
				hasher: (input: string) => {
					//@ts-ignore
					// return webcrypto.subtle.digest(hasherAlg.toUpperCase(), encoder.encode(input)).then((v) => new Uint8Array(v));
					return createHash(hasherAlg.replace('-', '')).update(input).digest()
				},
				algorithm: hasherAlg
			};
			return hasherAndAlgorithm;
		}

		const signer: Signer = (input) => {
			return sign(hasherAndAlgorithm(keyAlgorithm).algorithm, Buffer.from(input), {
				dsaEncoding: 'ieee-p1363',
				key: key as KeyObject
			})
		}

		const saltGenerator = () => {
			const buffer = randomBytes(16);
			return buffer.toString('base64')
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=/g, '');
		};


		const issuanceDate = new Date();
		payload.iat = Math.floor(issuanceDate.getTime() / 1000);

		// set token expiration to one year
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		payload.exp = Math.floor(expirationDate.getTime() / 1000);

		payload.iss = config.url;

		payload.sub = await calculateJwkThumbprint(payload.cnf.jwk);

		headers.x5c = issuerX5C;

		if (disclosureFrame != undefined) {
			const sdJwt = new SdJwt({
				header: { ...headers, alg: keyAlgorithm as SignatureAndEncryptionAlgorithm },
				payload
			}).withHasher(hasherAndAlgorithm(keyAlgorithm))
				.withSigner(signer)
				.withSaltGenerator(saltGenerator)
				.withDisclosureFrame(disclosureFrame);
			const credential = await sdJwt.toCompact();
			return { credential };
		}
		else {
			throw new Error("Could not generate signature");
		}


	},
	getPublicKeyJwk: async function () {
		const publicKey = await importX509(issuerCertPem, keyAlgorithm);
		if (!publicKey) {
			throw new Error("Could not import issuer publicKey");
		}
		const jwk = await exportJWK(publicKey)
		return { jwk: { kid: issuerJwkKid, ...jwk, alg: keyAlgorithm, } };
	},
}

