import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import { appContainer } from "../../services/inversify.config";
import { OpenidForPresentationsReceivingService } from "../../services/OpenidForPresentationReceivingService";
import AppDataSource from "../../AppDataSource";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import base64url from "base64url";
import { VerifiablePresentationEntity } from "../../entities/VerifiablePresentation.entity";
import config from "../../../config";
import { CONSENT_ENTRYPOINT } from "../../authorization/constants";

export class VIDAuthenticationComponent extends AuthenticationComponent {
	private presentationReceivingService = appContainer.resolve(OpenidForPresentationsReceivingService)
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

		if (!authorizationServerState || !vp_token) {
			return;
		}

		// unwrap the vp_token to find the personal identifier inside the vp_token
		const vpPayload = JSON.parse(base64url.decode(vp_token.split('.')[1])) as { vp: any };
		const credential = vpPayload.vp.verifiableCredential[0];
		const vcPayload = JSON.parse(base64url.decode(credential.split('.')[1])) as { vc: any };
		const personalIdentifier = vcPayload.vc.credentialSubject.personalIdentifier as string;
		authorizationServerState.personalIdentifier = personalIdentifier;

		req.session.authenticationChain.vidAuthenticationComponent = {
			personalIdentifier: personalIdentifier
		};
		await AppDataSource.getRepository(AuthorizationServerState).save(authorizationServerState);
		return res.redirect(this.protectedEndpoint);

	}

	private async askForPresentation(req: Request, res: Response): Promise<any> {
		const { url, stateId } = await this.presentationReceivingService.generateAuthorizationRequestURL("vid", config.url + CONSENT_ENTRYPOINT);
	
		// attach the vid_auth_state with an authorization server state
		req.authorizationServerState.vid_auth_state = stateId;
		await AppDataSource.getRepository(AuthorizationServerState).save(req.authorizationServerState);
		return res.redirect(url.toString());
	}
	
	
}

