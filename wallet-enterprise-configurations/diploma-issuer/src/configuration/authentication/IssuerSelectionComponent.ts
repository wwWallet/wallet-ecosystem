import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import locale from "../locale";
import config from "../../../config";

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
	
			if (req.method == "POST") {
				return this.handleIssuerSelectionSubmission(req, res);
			}
	
			return this.renderIssuerSelection(req, res);
		})
		.catch(() => {
			return next();
		});
	}


	
	private async hasSelectedIssuer(req: Request): Promise<boolean> {
		if (!req.session.authenticationChain?.issuerSelectionComponent?.institutionId) {
			return false;
		}
		return true;
	}

	private async handleIssuerSelectionSubmission(req: Request, res: Response): Promise<any> {
		const { issuer } = req.body;
		if (issuer) {
			req.session.authenticationChain.issuerSelectionComponent = {
				institutionId: issuer
			};


			req.authorizationServerState.credential_issuer_identifier = config.url + '/' + issuer;

			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderIssuerSelection(req, res);
		}
	}

	private async renderIssuerSelection(req: Request, res: Response): Promise<any> {
		res.render('issuer/selection', {
			title: "Issuer Selection",
			lang: req.lang,
			locale: locale[req.lang]
		})
	}

}

			