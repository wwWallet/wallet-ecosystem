
export const config = {
	url: "http://wallet-enterprise-issuer:8003",
	port: "8003",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "issuer"
	},
	display: [
		{
			name: "wwWallet Issuer",
			logo: { uri: "http://wallet-enterprise-issuer:8003/images/logo.png" },
			locale: "en-US"
		}
	],
	issuanceFlow: {
		skipConsent: false,
		defaultCredentialConfigurationIds: ["urn:eu.europa.ec.eudi:pid:1"],
		batchCredentialIssuance: {
			batchSize: 1,
		}
	},
	presentationFlow: {
		response_mode: "direct_post.jwt"
	},
	appType: 'ISSUER', //ISSUER,VERIFIER
	wwwalletURL: "http://localhost:3000/cb",
	trustedRootCertificates: [
		`-----BEGIN CERTIFICATE-----
MIICQDCCAeegAwIBAgIUa5v+g+yHrVdDFEfRy8GyoGtcT4YwCgYIKoZIzj0EAwIw
PzELMAkGA1UEBhMCRVUxFTATBgNVBAoMDHd3V2FsbGV0Lm9yZzEZMBcGA1UEAwwQ
d3dXYWxsZXQgUm9vdCBDQTAeFw0yNTA0MjIxMDM5NDZaFw00MDA0MTgxMDM5NDZa
MD8xCzAJBgNVBAYTAkVVMRUwEwYDVQQKDAx3d1dhbGxldC5vcmcxGTAXBgNVBAMM
EHd3V2FsbGV0IFJvb3QgQ0EwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASkZIoc
6df1R0mEWz3qHQxgRjKDtVTZvDzhPCEqVTePw4zSzy8T0VCdOH77ItRP1w3Rwjeg
vHrY1CzmMNtQDWoMo4HAMIG9MB0GA1UdDgQWBBTQca7dP79aqHfI2J/P2w134c8F
LjAOBgNVHQ8BAf8EBAMCAQYwMgYDVR0SBCswKYERaW5mb0B3d3dhbGxldC5vcmeG
FGh0dHBzOi8vd3d3YWxsZXQub3JnMBIGA1UdEwEB/wQIMAYBAf8CAQAwRAYDVR0f
BD0wOzA5oDegNYYzaHR0cHM6Ly93d3dhbGxldC5vcmcvaWFjYS9jcmwvd3d3YWxs
ZXRfb3JnX2lhY2EuY3JsMAoGCCqGSM49BAMCA0cAMEQCIF+qqe7urRAop2jQJ6B9
fYvvp4c4HYxsWLNa9aYpCWxxAiAGgtVdZWW19dDU1G0AGy8FTWlcKiczWyVIQtvA
L3rT4w==
-----END CERTIFICATE-----`
	],
	trustedIssuers: [
		"http://wallet-enterprise-issuer:8003"
	],
	clockTolerance: 60,
	siteConfig: {
		"name": "wwWallet Issuer",
		"short_name": "wwWallet Issuer",
		"theme_color": "#353f55",
		"background_color": "#353f55",
	}
}