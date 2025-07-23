import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import locale from "../locale";

export class InspectPersonalInfoComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {

		return super.authenticate(req, res, async () => {
			if (this.hasProceeded(req)) {
				return next();
			}

			if (req.method == "POST") {
				return this.handleProceed(req, res);
			}

			return this.renderPersonalInfo(req, res);
		})
		.catch(() => {
			return next();
		});
	}

	private hasProceeded(req: Request): boolean {
		if (!req.session.authenticationChain.inspectPersonalInfoComponent?.proceed) {
			return false;
		}
		return true
	}

	private async handleProceed(req: Request, res: Response): Promise<any> {
		req.session.authenticationChain.inspectPersonalInfoComponent = {
			proceed: true
		};
		
		if (req.body.has('proceed')) {
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderPersonalInfo(req, res);
		}
	}

	private async renderPersonalInfo(req: Request, res: Response): Promise<any> {
		res.render('issuer/personal-info', {
			title: "Personal Information",
			info: req.authorizationServerState,
			lang: req.lang,
			locale: locale[req.lang]
		})
	}
	
	
}

