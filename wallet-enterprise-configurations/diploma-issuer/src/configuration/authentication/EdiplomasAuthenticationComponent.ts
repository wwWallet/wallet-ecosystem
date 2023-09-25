import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { jwtVerify } from "jose";
import QueryString, { ParsedQs } from "qs";
import { AuthenticationComponent } from "../../authentication/AuthenticationComponent";
import config from "../../../config";
import locale from "../locale";


export class EdiplomasAuthenticationComponent extends AuthenticationComponent {

	private readonly configuration = {
		'authorizationEndpoint': 'http://localhost:4096/oauth/',
		'tokenEndpoint': "http://localhost:4096/oauth/token",
		'resourceServer': "https://localhost:4097/data",
    'documentEndpoint': '',
		'callbackEndpoint': "http://wallet-enterprise-diploma-issuer:8000/callback/",
    'publicEndpoint': '',
		'clientID': "3aba99",
		'clientSecret': "o9scygdm",
		'scopes': ['dates', 'grade', 'issuer', 'level', 'title', 'identifiers'],
	};

	private readonly authorizationRequestParams = {
		scope: this.configuration.scopes.join(' '),
		client_id: this.configuration.clientID,
		redirect_uri: this.configuration.callbackEndpoint,
		response_type: 'code',
		fixed_time: 1,
		lang: 'en'
	}	

	private secret = config.appSecret;

	constructor(
		public override identifier: string,
		public override protectedEndpoint: string,
	) { super(identifier, protectedEndpoint) }

	public override async authenticate(
		req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
		res: Response<any, Record<string, any>>,
		next: NextFunction) {
		
		return super.authenticate(req, res, async () => {
			if (await this.isAuthenticated(req)) {
				return next();
			}
			if (req.method == "GET" && req.url == this.configuration.callbackEndpoint) {
				return this.callbackHandler(req, res);
			}
	
			return this.sendAuthorizationRequest(req, res);
		})
		.catch(() => {
			return next();
		});
	}

	private async isAuthenticated(req: Request): Promise<boolean> {
		const jws = req.cookies['ediplomas_authentication_jws'];
		if (!jws) {
			return false;
		}
		return jwtVerify(jws, new TextEncoder().encode(this.secret)).then(() => {
			return (false) // change for ediplomas authentication
			// return (req.authorizationServerState.ediplomas_response != undefined)
		}).catch(err => {
			console.error(err);
			return false;
		})
	}

	private async sendAuthorizationRequest(_req: Request, res: Response): Promise<any> {
		const queryParamsString = QueryString.stringify(this.authorizationRequestParams)
		return res.redirect(this.configuration.authorizationEndpoint + '?' + queryParamsString);
	}

	private async callbackHandler(req: Request, res: Response): Promise<any> {
		const { code } = req.body;
		if (!code) {
			return res.render('error', {
				msg: "Authorization code does not received",
				lang: req.lang,
				locale: locale[req.lang]
			});
		}

		// const tokenRequestBody = {
		// 	scope: this.configuration.scopes.join(' '),
		// 	username: this.configuration.clientID,
		// 	password: this.configuration.clientSecret,
		// 	code: code,
		// 	grant_type: 'authorization_code'
		// };

		// const tokenRequestHeaders = {
		// 	'Authorization': `Basic ${Buffer.from(this.configuration.clientID+':'+this.configuration.clientSecret).toString('base64')}`,
		// 	'Content-Type': 'application/x-www-form-urlencoded'
		// };
		// const tokenRequestQueryString = QueryString.stringify(tokenRequestBody);

		// const tokenResponseAxiosRes = await axios.post(this.configuration.tokenEndpoint, tokenRequestQueryString, { headers: tokenRequestHeaders });
		// const { access_token, sub } = tokenResponseAxiosRes.data;
		

		// const resourceEndpointRequestHeaders = {
		// 	'Authorization': `Bearer ${access_token}`
		// };

		// const resourceEndpointResponseAxiosRes = await axios.get(this.configuration.resourceServer, { headers: resourceEndpointRequestHeaders });

		// req.authorizationServerState.ediplomas_response = resourceEndpointResponseAxiosRes.data;
		// sign a token and send it to the client
		// const jws = await new SignJWT({ })
		// 	.setSubject(sub)
		// 	.setProtectedHeader({ alg: 'HS256' })
		// 	.setIssuedAt()
		// 	.setExpirationTime('1h')
		// 	.sign(new TextEncoder().encode(this.secret));
		// res.cookie('ediplomas_authentication_jws', jws);
		return res.redirect(this.protectedEndpoint);

	}
}


