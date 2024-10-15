
export const config = {
	url: "http://wallet-enterprise-acme-verifier:8005",
	port: "8005",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "verifier"
	},
	display: [ ],
	issuanceFlow: {
		skipConsent: false,
		defaultCredentialConfigurationIds: [],
	},
	wwwalletURL: "http://localhost:3000/cb",
	trustedRootCertificates: [],
	sessionIdCookieConfiguration: {
		maxAge: 900000, // 15-mins
		secure: false
	}
}