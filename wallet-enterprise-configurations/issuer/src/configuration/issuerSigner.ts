import 'reflect-metadata';
import { config } from "../../config";
import { CredentialSigner } from "../services/interfaces";
import fs from 'fs';
import path from "path";
import { Jwt, SDJwt } from "@sd-jwt/core";
import { Disclosure } from "@sd-jwt/utils";
import { digest as hasher } from "@sd-jwt/crypto-nodejs";
import { sign, randomBytes, KeyObject } from "crypto";
import { importPrivateKeyPem } from '../lib/importPrivateKeyPem';
import {  base64url, calculateJwkThumbprint, exportJWK, importX509 } from 'jose';
import { Document } from '@auth0/mdl';
import { cborEncode } from "@auth0/mdl/lib/cbor";
import { pemToBase64 } from '../util/pemToBase64';

const issuerPrivateKeyPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.key"), 'utf-8').toString();
const issuerCertPem = fs.readFileSync(path.join(__dirname, "../../../keys/pem.crt"), 'utf-8').toString() as string;;

const issuerX5C = [
	pemToBase64(issuerCertPem),
];

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
		const signed = new Date();
		const validFromDate = new Date(signed.getTime() + 1000);
		const expirationDate = new Date();

		expirationDate.setFullYear(expirationDate.getFullYear() + 1);
		const signedDocument = await document
			.addValidityInfo({
				signed: signed,
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
		const issuanceDate = new Date();
		const expirationDate = new Date();
		expirationDate.setFullYear(expirationDate.getFullYear() + 1);

		headers.x5c = issuerX5C;

		if (!disclosureFrame) {
			throw new Error("Could not generate signature");
		}

		const claims: {
			[key: string]: unknown
		} = {
			iat: Math.floor(issuanceDate.getTime() / 1000),
			// set token expiration to one year
			exp: Math.floor(expirationDate.getTime() / 1000),
			iss: config.url,
			sub: await calculateJwkThumbprint(payload.cnf.jwk),
			cnf: payload.cnf,
			vct: payload.vct,
			'vct#integrity': payload['vct#integrity'],
			jti: payload.jti
		};

		const disclosures = Object.keys(disclosureFrame)
			.filter(key => disclosureFrame[key])
			.map(key => {
				return new Disclosure([this.saltGenerator(), key, payload[key]])
			});

		const jwt = new Jwt({
			header: { ...headers, alg: 'ES256' },
			payload: {
				_sd: await Promise.all(
					disclosures.map(disclosure => { return disclosure.digest(this.hasherAndAlgorithm) })
				),
				...claims
			}
		})
		await jwt.sign(this.signer());

		const sdJwt = new SDJwt({ jwt, disclosures });
		const credential = await sdJwt.encodeSDJwt();

		return { credential };
	},
	getPublicKeyJwk: async function () {
		const publicKey = await importX509(issuerCertPem, 'ES256');
		if (!publicKey) {
			throw new Error("Could not import issuer publicKey");
		}
		const jwk = await exportJWK(publicKey)
		return { jwk: { kid: issuerJwkKid, ...jwk } };
	},
	key: async function () {
		const key = await importPrivateKeyPem(issuerPrivateKeyPem, 'ES256');
		if (!key) {
			throw new Error("Could not import private key");
		}
		return key as KeyObject;
	},
	signer: function () {
		return async (input: string) => {
			const result = sign(null, Buffer.from(input), {
				dsaEncoding: 'ieee-p1363',
				key: await this.key() as KeyObject
			})
			return Buffer.from(result).toString('base64url')
		}
	},
	hasherAndAlgorithm: {
		hasher,
		alg: 'sha-256',
	},
	saltGenerator: () => {
		const buffer = randomBytes(16);
		return buffer.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
	},
}

