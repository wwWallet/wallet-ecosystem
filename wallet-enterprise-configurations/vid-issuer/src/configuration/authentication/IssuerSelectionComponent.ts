import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { appContainer } from "../../services/inversify.config";
import { CredentialIssuersConfiguration } from "../../services/interfaces";
import { TYPES } from "../../services/types";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";

const credentialIssuersConfigurationService = appContainer.get<CredentialIssuersConfiguration>(TYPES.CredentialIssuersConfiguration);


export class IssuerSelectionComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.hasSelectedIssuer(req)) {
				return next();
			}

			this.defineTheDefaultIssuer(req, res);	
		})
		.catch(() => {
			return next();
		});
	}


	
	private async hasSelectedIssuer(req: Request): Promise<boolean> {
		const credentialIssuerIdentifier = req.authorizationServerState.credential_issuer_identifier;
		console.log("Credential issuer identifier = ", credentialIssuerIdentifier)
		if (!credentialIssuerIdentifier) {
			return false;
		}
		return true;
	}


	private async defineTheDefaultIssuer(req: Request, res: Response) {
		const defaultCredentialIssuerIdentifier = credentialIssuersConfigurationService.defaultCredentialIssuerIdentifier()
		if (!defaultCredentialIssuerIdentifier) {
			throw new Error("No default credential issuer is defined")
		}
		req.authorizationServerState.credential_issuer_identifier = defaultCredentialIssuerIdentifier;


		const credentialIssuer = credentialIssuersConfigurationService
			.registeredCredentialIssuerRepository()
			.getCredentialIssuer(defaultCredentialIssuerIdentifier);
		if (!credentialIssuer) {
			throw new Error("Credential issuer not found")
		}

		// load all supported credentials for this Credential Issuer into the authorization details
		req.authorizationServerState.authorization_details = credentialIssuer.supportedCredentials.map((sc) => {
			return { 
				type: 'openid_credential',
				types: sc.exportCredentialSupportedObject().types ?? [],
				format: sc.exportCredentialSupportedObject().format ?? ""
			}
		}).filter((ad => ad.types.length != 0));
		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		return res.redirect(CONSENT_ENTRYPOINT);
	}


}

			