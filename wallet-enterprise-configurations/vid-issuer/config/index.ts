
export const config = {
	url: "http://wallet-enterprise-vid-issuer:8003",
	port: "8003",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "vidissuer"
	},
	display: [
		{
			name: "VID Issuer",
			locale: "en-US"
		}
	],
	issuanceFlow: {
		skipConsent: false,
		defaultCredentialConfigurationIds: [ "urn:credential:vid" ],
	},
	appType: 'ISSUER', //ISSUER,VERIFIER
	wwwalletURL: "http://localhost:3000/cb",
	trustedRootCertificates: [],
}