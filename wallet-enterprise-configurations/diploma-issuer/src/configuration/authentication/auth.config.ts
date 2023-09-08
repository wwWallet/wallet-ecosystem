export enum DIDAuthenticationMechanism {
	OPENID4VP_ID_TOKEN,
	OPENID4VP_VP_TOKEN,
	NONE,
}

export const DID_AUTHENTICATION_MECHANISM_USED: DIDAuthenticationMechanism = DIDAuthenticationMechanism.OPENID4VP_VP_TOKEN;