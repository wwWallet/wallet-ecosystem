import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import locale from "../locale";
import { parsePidData } from "../datasetParser";
import path from "path";
import titles from "../titles";



parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx")) // test parse

export class LocalAuthenticationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.isAuthenticated(req).catch(() => false)) {
				return next();
			}

	
			if (req.method == "POST") {
				return this.handleLoginSubmission(req, res);
			}
	
			return this.renderLogin(req, res);
		})
		.catch(() => {
			return next();
		});
	}


	
	private async isAuthenticated(req: Request): Promise<boolean> {
		console.log("Called is authentiated")
		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));
		if (!users) {
			throw new Error("Couldn't parse users");
		}
		console.log("Users = ", users)
		if (!req.session.authenticationChain?.localAuthenticationComponent?.username) {
			return false;
		}
		const username = req.session.authenticationChain.localAuthenticationComponent.username;
		if (!username || users.filter(u => u.User == username).length != 1) return false;

		const usersFound = users.filter(u => u.User == username);
		req.authorizationServerState.pid_id = String(usersFound[0].pid_id);
		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		return true;
	}

	private async renderLogin(req: Request, res: Response): Promise<any> {
		res.render('issuer/login', {
			title: titles.index,
			lang: req.lang,
			locale: locale[req.lang]
		})
	}

	private async renderFailedLogin(req: Request, res: Response): Promise<any> {
		res.render('issuer/login', {
			title: titles.index,
			lang: req.lang,
			locale: locale[req.lang],
			failed: true
		})
	}

	private async handleLoginSubmission(req: Request, res: Response): Promise<any> {
		const users = parsePidData(path.join(__dirname, "../../../../dataset/vid-dataset.xlsx"));

		if (!users) {
			throw new Error("Failed to load users");
		}
		const { username, password } = req.body;
		const usersFound = users.filter(u => u.User == username && u.Password == password);
		if (usersFound.length > 0) {

			req.session.authenticationChain.localAuthenticationComponent = {
				username: username
			};

			req.authorizationServerState.pid_id = String(usersFound[0].pid_id);
			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			return res.redirect(this.protectedEndpoint);
		}
		else {
			return this.renderFailedLogin(req, res);
		}
	}
}


