import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import locale from "../locale";
import { appContainer } from "../../services/inversify.config";
import { CredentialIssuersConfigurationService } from "../CredentialIssuersConfigurationService";

export class ClientSelectionComponent extends AuthenticationComponent {
	credentialIssuersConfigurationService = appContainer.resolve(CredentialIssuersConfigurationService);

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.hasSelectedClient(req)) {
				return next();
			}
	
			if (req.method == "POST") {
				return this.handleClientSelection(req, res);
			}
	
			return this.renderClientSelection(req, res);
		})
		.catch(() => {
			return next();
		});
	}


	
	private async hasSelectedClient(req: Request): Promise<boolean> {
		if (!req.session.authenticationChain?.clientSelectionComponent?.client_id) {
			return false;
		}
		return true;
	}

	private async handleClientSelection(req: Request, res: Response): Promise<any> {
		const { client_id } = req.body;
		console.log("Client id = ", client_id)
		if (client_id) {

			const client = this.credentialIssuersConfigurationService.registeredClients().filter(c => c.client_id === client_id)[0];

			if (!client) {
				return this.renderClientSelection(req, res);
			}

			req.session.authenticationChain.clientSelectionComponent = {
				client_id: client_id
			};

			req.authorizationServerState.redirect_uri = client.redirectUri;

			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderClientSelection(req, res);
		}
	}

	private async renderClientSelection(req: Request, res: Response): Promise<any> {
		res.render('issuer/client-selection', {
			title: "Client Selection",
			clients: this.credentialIssuersConfigurationService.registeredClients(),
			lang: req.lang,
			locale: locale[req.lang]
		})
	}

}

			