import config from "../../../config";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
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

publicKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'issuer.public.ecdh.json');
publicKeyContent = fs.readFileSync(publicKeyFilePath, 'utf8');
const credentialIssuerPublicKeyJWK = JSON.parse(publicKeyContent) as crypto.JsonWebKey;
// const credentialIssuerPublicKey = crypto.createPublicKey({ key: credentialIssuerPublicKeyJWK, format: 'jwk' });


publicKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'vault.public.ecdh.json');
publicKeyContent = fs.readFileSync(publicKeyFilePath, 'utf8');
const vaultPublicKeyJWK = JSON.parse(publicKeyContent) as crypto.JsonWebKey;
const vaultPublicKey = crypto.createPublicKey({ key: vaultPublicKeyJWK, format: 'jwk' });


var privateKeyFilePath;
var privateKeyContent;

privateKeyFilePath = path.resolve(currentWorkingDirectory, 'keys', 'issuer.private.ecdh.json');
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
			throw new Error("issuer_state was not found user session");
		}

		console.log('type of issuer state ', typeof userSession.issuer_state);
		if (!userSession.personalIdentifier) {
			throw new Error("Cannot generate credential: personalIdentifier is missing");
		}

		const { issuer_state } = userSession;
		console.log("issuer	state = ", userSession.issuer_state);
		let { plaintext } = await compactDecrypt(issuer_state, credentialIssuerPrivateKey);
		const {
			iss,
			exp,
			jti, // is the collection id
			aud,
			sub, // authorized identities to receive this specific credential,
			nonce,
		} = JSON.parse(new TextDecoder().decode(plaintext)) as { iss: string, exp: number, jti: string, aud: string, sub: string[], nonce: string };
	

		console.log("Issuer state attributes: ", {
			iss,
			exp,
			jti, // is the collection id
			aud,
			sub, // authorized identities to receive this specific credential
			nonce,
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

		console.log("User session = ", userSession)
		if (!sub || !sub.includes(userSession.personalIdentifier)) {
			console.log(`Personal identifier ${userSession.personalIdentifier} is not authorized to receive this credential`);
			throw new Error(`Personal identifier ${userSession.personalIdentifier} is not authorized to receive this credential`);
		}

		const collection_id = jti;
	
		const jwePayload = {
			iss: await calculateJwkThumbprint(credentialIssuerPublicKeyJWK),
			exp: Date.now() + 60*5, // expires in 5 minutes,
			jti: collection_id,
			aud: await calculateJwkThumbprint(vaultPublicKeyJWK),
			sub: userSession.personalIdentifier,
			nonce: nonce,
		};
	
		const fetchRequestToken = await new CompactEncrypt(new TextEncoder().encode(JSON.stringify(jwePayload)))
			.setProtectedHeader({
				alg: 'ECDH-ES+A256KW', // Elliptic Curve Diffie-Hellman Ephemeral Static with AES Key Wrap using 256-bit key
				enc: 'A256GCM', // AES GCM using 256-bit key
				epk: {
						kty: 'EC', // Elliptic Curve Key Type
						crv: 'P-256' // Curve name
						// you can add other parameters as needed, like 'x' and 'y' for specific key pairs
				}
			})
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


		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"id": `urn:pda1:${randomUUID()}`,
			"name": "PDA1",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This credential is issued by the National PDA1 credential issuer",
			"credentialSubject": {
				...claims,
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

		console.log("payload = ", payload)
		const disclosureFrame = {
			vc: {
				credentialSubject: {
					personalIdentifier: true,
					socialSecurityIdentification: {
						ssn: true
					},
					nationality: true,
					employer: {
						employmentType: true,
						name: true,
						employerId: true,
						typeOfId: true
					},
					decisionOnApplicableLegislation: {
						validityPeriod: {
							startingDate: true,
							endingDate: true
						}
					},
					address: true,
					placeOfWork: true,
					documentId: true,
					competentInstitution: {
						competentInstitutionId: true,
						competentInstitutionName: true,
						competentInstitutionCountryCode: true
					},
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

