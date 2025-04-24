
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
MIICMzCCAdqgAwIBAgIUdgESbTG9nxSXVImFdFHHAHGJ9RwwCgYIKoZIzj0EAwIw
IDERMA8GA1UEAwwId3dXYWxsZXQxCzAJBgNVBAYTAkdSMB4XDTI1MDMwNjE1Mzcz
M1oXDTM1MDMwNDE1MzczM1owIDERMA8GA1UEAwwId3dXYWxsZXQxCzAJBgNVBAYT
AkdSMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0Fm2MNVdwcARMDwXVaNJwcy1
G182BhnFhv7pDmqs4EFGlPvkG9oA02gBKeddJd7wcngcIH1cbpS64iG4r9d5R6OB
8TCB7jASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4E
FgQUfHj4bzyvo4unHysGt+pNa0XsBaIwHwYDVR0jBBgwFoAUfHj4bzyvo4unHysG
t+pNa0XsBaIwOgYDVR0fBDMwMTAvoC2gK4YpaHR0cDovL3VzZXJzLnVvYS5nci9+
cHN0YW1hdG9wL2NhLWNybC5wZW0wIAYDVR0RBBkwF4YVaHR0cDovL3d3dy53YWxs
ZXQub3JnMCoGA1UdEgQjMCGGFWh0dHA6Ly93d3cud2FsbGV0LmNvbYIId3dXYWxs
ZXQwCgYIKoZIzj0EAwIDRwAwRAIgGMfgLwOXvEk0sD3nEtCuwkZRzX9vyYZ/hfg6
VPrJszACIHBsYf7toXfUFjr6y1nAJ/oXP9l/fWBDydcQIq+Vnfem
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