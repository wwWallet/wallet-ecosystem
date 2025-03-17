import 'reflect-metadata';
import { config } from "../../config";
import { CredentialSigner } from "../services/interfaces";
import fs from 'fs';
import path from "path";
import { HasherAlgorithm, HasherAndAlgorithm, SdJwt, SignatureAndEncryptionAlgorithm, Signer } from "@sd-jwt/core";
import { sign, randomBytes, createHash, KeyObject } from "crypto";
import { importPrivateKeyPem } from '../lib/importPrivateKeyPem';
import {  base64url, calculateJwkThumbprint, exportJWK, importX509 } from 'jose';
import { Document } from '@auth0/mdl';
import { cborEncode } from "@auth0/mdl/lib/cbor";

const issuerX5C: string[] = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../keys/x5c.json"), 'utf-8').toString()) as string[];
const issuerPrivateKeyPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.key"), 'utf-8').toString();
const issuerCertPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.crt"), 'utf-8').toString() as string;;
// const caCertPem = fs.readFileSync(path.join(__dirname, "../../../keys/ca.crt"), 'utf-8').toString() as string;;

importPrivateKeyPem(issuerPrivateKeyPem, 'ES256') // attempt to import the key
importX509(issuerCertPem, 'ES256'); // attempt to import the public key

const issuerJwkKid = "8636af04-5796-4f46-a73e-d690d7d4e7f3";

export const issuerSigner: CredentialSigner = {
	signMsoMdoc: async function (doctype, namespaces, holderPublicKeyJwk) {

		const key = await importPrivateKeyPem(issuerPrivateKeyPem, 'ES256');
		if (!key) {
			throw new Error("Could not import private key");
		}
		const document = new Document(doctype)
		for (const [ns, nsData] of namespaces) {
			document.addIssuerNameSpace(ns, { ...nsData })
		}
		console.log("Cert = ", importX509(issuerCertPem, 'ES256'))

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
				alg: 'ES256',
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
		const key = await importPrivateKeyPem(issuerPrivateKeyPem, 'ES256');
		if (!key) {
			throw new Error("Could not import private key");
		}
		const signer: Signer = (input, header) => {
			if (header.alg !== SignatureAndEncryptionAlgorithm.ES256) {
				throw new Error('only ES256 is supported')
			}
			return sign(null, Buffer.from(input), {
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

		const hasherAndAlgorithm: HasherAndAlgorithm = {
			hasher: (input: string) => createHash('sha256').update(input).digest(),
			algorithm: HasherAlgorithm.Sha256
		}


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
				header: { ...headers, alg: SignatureAndEncryptionAlgorithm.ES256 },
				payload
			}).withHasher(hasherAndAlgorithm)
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
		const publicKey = await importX509(issuerCertPem, 'ES256');
		if (!publicKey) {
			throw new Error("Could not import issuer publicKey");
		}
		const jwk = await exportJWK(publicKey)
		return { jwk: jwk };
	},
}

