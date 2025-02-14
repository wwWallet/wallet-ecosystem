
export const config = {
	url: "http://wallet-enterprise-ruthless-issuer:8010",
	port: "8010",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "ruthlessissuer"
	},
	display: [
		{
			name: "Ruthless Issuer",
			locale: "en-US"
		}
	],
	issuanceFlow: {
		skipConsent: false,
		defaultCredentialConfigurationIds: [ "urn:credential:ruthless" ],
	},
	presentationFlow: {
		response_mode: "direct_post.jwt"
	},
	appType: 'ISSUER', //ISSUER,VERIFIER
	supportsdjwtvc: true,
	wwwalletURL: "http://localhost:3000/cb",
	trustedRootCertificates: [
		`-----BEGIN CERTIFICATE-----
MIIB3DCCAYECFHBDWpkLi64f5ZrF0xuytj5PIrbqMAoGCCqGSM49BAMCMHAxCzAJ
BgNVBAYTAkdSMQ8wDQYDVQQIDAZBdGhlbnMxEDAOBgNVBAcMB0lsbGlzaWExETAP
BgNVBAoMCHd3V2FsbGV0MREwDwYDVQQLDAhJZGVudGl0eTEYMBYGA1UEAwwPd3d3
YWxsZXQtaXNzdWVyMB4XDTI0MDkyNjA4MTQxMloXDTM0MDkyNDA4MTQxMlowcDEL
MAkGA1UEBhMCR1IxDzANBgNVBAgMBkF0aGVuczEQMA4GA1UEBwwHSWxsaXNpYTER
MA8GA1UECgwId3dXYWxsZXQxETAPBgNVBAsMCElkZW50aXR5MRgwFgYDVQQDDA93
d3dhbGxldC1pc3N1ZXIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQtY9kUQFfD
f6iocFE4rRvy3GMyYypqmX3ZjmwUeXJy0kkgRT73C8+WPkWNg/ydJHCEDDO5XuRa
IaOHc9DpLpNSMAoGCCqGSM49BAMCA0kAMEYCIQDzw27nBr7E8N6Gqc83v/6+9izi
/NEXBKlojwLJAeSlsAIhAO2JdjPEz3bD0stoWEg7RDtrAm8dsgryCy1W5BDGCVdN
-----END CERTIFICATE-----`
	],
}