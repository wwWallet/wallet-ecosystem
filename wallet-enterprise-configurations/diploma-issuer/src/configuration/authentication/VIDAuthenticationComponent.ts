import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { VerifiablePresentationEntity } from "../../entities/VerifiablePresentation.entity";
import config from "../../../config";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";
import { GrantType } from "../../types/oid4vci";
import locale from "../locale";
import * as qrcode from 'qrcode';
import { openidForPresentationReceivingService } from "../../services/instances";
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
		if (!req.session.authenticationChain.vidAuthenticationComponent?.personalIdentifier) {
			return false;
		}
		return true
	}

	private async handleCallback(req: Request, res: Response): Promise<any> {
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

		if (!authorizationServerState || !vp_token || !queryRes.claims || !queryRes.claims["VID"]) {
			return;
		}
		const personalIdentifier = queryRes.claims["VID"].filter((claim) => claim.name == 'personalIdentifier')[0].value ?? null;
		if (!personalIdentifier) {
			return;
		}
		authorizationServerState.personalIdentifier = personalIdentifier;
		authorizationServerState.ssn = personalIdentifier; // update the ssn as well, because this will be used to fetch the diplomas

		req.session.authenticationChain.vidAuthenticationComponent = {
			personalIdentifier: personalIdentifier
		};

		console.log("Personal identifier = ", personalIdentifier)
		req.authorizationServerState.ssn = personalIdentifier;

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



		const { url, stateId } = await openidForPresentationReceivingService.generateAuthorizationRequestURL({req, res}, "vid", config.url + CONSENT_ENTRYPOINT);
	
		// attach the vid_auth_state with an authorization server state
		req.authorizationServerState.vid_auth_state = stateId;
		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		console.log("Authz state = ", req.authorizationServerState)
		if (req.authorizationServerState.grant_type && req.authorizationServerState.grant_type == GrantType.PRE_AUTHORIZED_CODE) {
			// render a page which shows a QR code and a button with the url for same device authentication

			let authorizationRequestQR = await new Promise((resolve) => {
				qrcode.toDataURL(url.toString(), {
					margin: 1,
					errorCorrectionLevel: 'L',
					type: 'image/png'
				}, 
				(err, data) => {
					if (err) return resolve("NO_QR");
					return resolve(data);
				});
			}) as string;
			return res.render('issuer/vid-auth-component', {
				title: "VID authentication",
				wwwalletURL: config.wwwalletURL,
				authorizationRequestURL: url.toString(),
				authorizationRequestQR: authorizationRequestQR,
				state: url.searchParams.get('state'),
				lang: req.lang,
				locale: locale[req.lang]
			});
		}
		return res.redirect(url.toString());
	}
	
	
}

