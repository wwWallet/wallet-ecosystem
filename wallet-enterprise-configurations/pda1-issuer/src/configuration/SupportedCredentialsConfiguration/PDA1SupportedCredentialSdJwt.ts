import config from "../../../config";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import crypto, { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { compactDecrypt, calculateJwkThumbprint, CompactEncrypt } from 'jose';
const currentWorkingDirectory = __dirname + "/../../../../";

var publicKeyFilePath;
var publicKeyContent;

publicKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'issuer.public.rsa.json');
publicKeyContent = fs.readFileSync(publicKeyFilePath, 'utf8');
const credentialIssuerPublicKeyJWK = JSON.parse(publicKeyContent) as crypto.JsonWebKey;
// const credentialIssuerPublicKey = crypto.createPublicKey({ key: credentialIssuerPublicKeyJWK, format: 'jwk' });


publicKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'vault.public.rsa.json');
publicKeyContent = fs.readFileSync(publicKeyFilePath, 'utf8');
const vaultPublicKeyJWK = JSON.parse(publicKeyContent) as crypto.JsonWebKey;
const vaultPublicKey = crypto.createPublicKey({ key: vaultPublicKeyJWK, format: 'jwk' });


var privateKeyFilePath;
var privateKeyContent;

privateKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'issuer.private.rsa.json');
privateKeyContent = fs.readFileSync(privateKeyFilePath, 'utf8');
const credentialIssuerPrivateKeyJWK = JSON.parse(privateKeyContent) as crypto.JsonWebKey;
const credentialIssuerPrivateKey = crypto.createPrivateKey({ key: credentialIssuerPrivateKeyJWK, format: 'jwk' });

export class PDA1SupportedCredentialSdJwt implements SupportedCredentialProtocol {


	constructor(private credentialIssuerConfig: CredentialIssuer) { }

	getCredentialIssuerConfig(): CredentialIssuer {
		return this.credentialIssuerConfig;
	}
	getId(): string {
		return "urn:credential:pda1"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.VC_SD_JWT;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "PDA1Credential", this.getId()];
	}
	getDisplay(): Display {
		return {
			name: "PDA1 Credential",
			logo: { url: config.url + "/images/pda1.png" },
			background_color: "#4CC3DD"
		}
	}


	async getProfile(_userSession: AuthorizationServerState): Promise<CredentialView | null> {
		return null;
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession.issuer_state || userSession.issuer_state == "null") {
			throw new Error("issuer_state was found user session");
		}

		console.log('type of issuer state ', typeof userSession.issuer_state);
		if (!userSession.ssn) {
			throw new Error("ssn was found on the user session");
		}

		const { issuer_state } = userSession;
		console.log("issuer	state = ", userSession.issuer_state);
		let { plaintext } = await compactDecrypt(issuer_state, credentialIssuerPrivateKey);
		const {
			iss,
			exp,
			jti, // is the collection id
			aud,
			sub, // authorized identities to receive this specific credential
		} = JSON.parse(new TextDecoder().decode(plaintext)) as { iss: string, exp: number, jti: string, aud: string, sub: string[] };
	

		console.log("Issuer state attributes: ", {
			iss,
			exp,
			jti, // is the collection id
			aud,
			sub, // authorized identities to receive this specific credential
		})
		const expectedIssuer = await calculateJwkThumbprint(vaultPublicKeyJWK);
		if (!iss || iss !== expectedIssuer) {
			throw new Error(`'iss' is missing from issuer_state or expected value '${expectedIssuer}'`);
		}

		const expectedAudience = await calculateJwkThumbprint(credentialIssuerPublicKeyJWK);
		if (!aud || aud !== expectedAudience) {
			throw new Error(`'aud' is missing from issuer_state or expected value for '${expectedAudience}'`);
		}

		if (exp && Math.floor(Date.now() / 1000) > exp) {
			console.log("Exp cmp = ", Math.floor(Date.now() / 1000) > exp)
			throw new Error(`'exp' is missing from issuer_state or the issuer_state is expired`);
		} 

		if (!sub || !sub.includes(userSession.ssn)) {
			throw new Error(`SSN ${userSession.ssn} is not authorized to receive this credential`);
		}

		const collection_id = jti;
	
		const jwePayload = {
			iss: await calculateJwkThumbprint(credentialIssuerPublicKeyJWK),
			exp: Date.now() + 60*5, // expires in 5 minutes,
			jti: collection_id,
			aud: await calculateJwkThumbprint(vaultPublicKeyJWK),
			sub: userSession.ssn,
		};
	
		const fetchRequestToken = await new CompactEncrypt(new TextEncoder().encode(JSON.stringify(jwePayload)))
			.setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
			.encrypt(vaultPublicKey);
	
		let fetchResponse = null;
		try {
			fetchResponse = await axios.post('http://resources-vault:6555/fetch', {
				fetch_request_token: fetchRequestToken
			});
		}
		catch(err) {
			console.log(err)
			console.error('Failed fetch request')
			throw new Error("Failed fetch request");
		}
		if (fetchResponse == null || !fetchResponse.data.claims) {
			console.error("'claims' is missing from resources vault fetch response");
			throw new Error("'claims' is missing from resources vault fetch response");
		}

		const { claims } = fetchResponse.data;
		console.log("Claims = ", claims)
		const pda1: CredentialSubject = {
			id: holderDID,
			...claims
		} as any;

		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:pda1:${randomUUID()}`,
			"name": "PDA1",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National PDA1 credential issuer",
			"credentialSubject": {
				...pda1,
				"id": holderDID,
			},
			"credentialBranding": {
				"image": {
					"url": config.url + "/images/pda1.png"
				},
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
		};

		const disclosureFrame = {
			vc: {
				credentialSubject: {
					dateOfBirth: true,
					personalIdentifier: true,
				}
			}
		}
		const { jws } = await this.getCredentialIssuerConfig().getCredentialSigner()
			.sign({
				vc: payload
			}, {}, disclosureFrame);
    const response = {
      format: this.getFormat(),
      credential: jws
    };

		return response;
	}

	exportCredentialSupportedObject(): CredentialSupportedJwtVcJson {
		return {
			id: this.getId(),
			format: this.getFormat(),
			display: [this.getDisplay()],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

