import base64url from "base64url";
import AppDataSource from "../AppDataSource";
import { AuthorizationServerState } from "../entities/AuthorizationServerState.entity";

export async function verificationCallback(authorizationServerState: AuthorizationServerState, presentation: any) {
	
	const vcjwt = presentation.verifiableCredential[0];
	if (!vcjwt)
		return;
	const payload = JSON.parse(base64url.decode(vcjwt.split('.')[1])) as any;



	// update with ssn
	authorizationServerState.ssn = payload.vc.credentialSubject.personalIdentifier;
	console.log("Personal identifier on callback is " +  payload.vc.credentialSubject.personalIdentifier);
	await AppDataSource.getRepository(AuthorizationServerState).save(authorizationServerState);
}