import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { VerifiablePresentationEntity } from "../../entities/VerifiablePresentation.entity";
import config from "../../../config";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import locale from "../locale";
import { openidForPresentationReceivingService, verifierConfigurationService } from "../../services/instances";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";

export class VIDAuthenticationComponent extends AuthenticationComponent {

	constructor(
		override identifier: string,
		override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {

		return super.authenticate(req, res, async () => {
			if (this.personalIdentifierHasBeenExtracted(req)) {
				return next();
			}

			if (req.authorizationServerState.authenticationMethod &&
					req.authorizationServerState.authenticationMethod != UserAuthenticationMethod.VID_AUTH) {
				return next();
			}

			if (req.method == "GET" && req.query.state) {
				return this.handleCallback(req, res);
			}

			return this.askForPresentation(req, res);
		})
		.catch(() => {
			return next();
		});
	}

	private personalIdentifierHasBeenExtracted(req: Request): boolean {
		console.log("VID auth started")
		console.log(req.session.authenticationChain.vidAuthenticationComponent)
		if (!req.session.authenticationChain.vidAuthenticationComponent?.document_number) {
			return false;
		}
		return true
	}

	private async handleCallback(req: Request, res: Response): Promise<any> {
		console.log("handling callback...")
		const state = req.query.state as string; // find the vp based on the state

		const queryRes = await AppDataSource.getRepository(VerifiablePresentationEntity)
			.createQueryBuilder("vp")
			.where("vp.state = :state_id", { state_id: state })
			.getOne();
		if (!queryRes) {
			return;
		}
		const vp_token = queryRes.raw_presentation;

		const authorizationServerState = await AppDataSource.getRepository(AuthorizationServerState)
			.createQueryBuilder("state")
			.where("state.vid_auth_state = :vid_auth_state", { vid_auth_state: state })
			.getOne();

		if (!authorizationServerState || !vp_token || !queryRes.claims) {
			throw new Error("Generic error")
		}

		const document_number = queryRes.claims["VID"].filter((claim) => claim.name == 'Document Number')[0].value ?? null;
		if (!document_number) {
			console.log("at least one of (document_number) is missing")
			return res.redirect('/');
		}

		console.log("Document number extracred = ", document_number)
		authorizationServerState.document_number = document_number;


		req.session.authenticationChain.vidAuthenticationComponent = {
			document_number,
		};

		await AppDataSource.getRepository(AuthorizationServerState).save(authorizationServerState);
		return res.redirect(this.protectedEndpoint);

	}

	private async askForPresentation(req: Request, res: Response): Promise<any> {
		if (req.body.state && req.method == "POST") {
			console.log("Got state = ", req.body.state)
			const { status } = await openidForPresentationReceivingService.getPresentationByState(req.body.state as string);
			if (status) {
				return res.redirect(`${CONSENT_ENTRYPOINT}?state=${req.body.state}`);
			}
			else {
				return res.render('issuer/vid-auth-component', {
					state: req.body.state,
					authorizationRequestURL: req.body.authorizationRequestURL,
					authorizationRequestQR: req.body.authorizationRequestQR,
					lang: req.lang,
					locale: locale[req.lang],
				})
			}
		}


		const presentationDefinition = JSON.parse(JSON.stringify(verifierConfigurationService.getPresentationDefinitions().filter(pd => pd.id == "vid")[0])) as any;

		try {
			const { url, stateId } = await openidForPresentationReceivingService.generateAuthorizationRequestURL({req, res}, presentationDefinition, config.url + CONSENT_ENTRYPOINT);
			console.log("Authorization request url = ", url)
			// attach the vid_auth_state with an authorization server state
			req.authorizationServerState.vid_auth_state = stateId;
			await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
			console.log("Authz state = ", req.authorizationServerState)
			return res.redirect(url.toString());

		}
		catch(err) {
			console.log(err);
			return res.redirect('/');
		}

	}
	
	
}

