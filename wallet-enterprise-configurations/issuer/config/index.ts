
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
	keyAlgorithm: 'ES256',
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
-----END CERTIFICATE-----`,
		`-----BEGIN CERTIFICATE-----
MIIC2jCCAjugAwIBAgIUKf90UHk2Wl7XRckqp5FgoLJe3E8wCgYIKoZIzj0EAwQw
UDELMAkGA1UEBhMCR1IxFTATBgNVBAoMDHd3V2FsbGV0Lm9yZzEqMCgGA1UEAwwh
SUFDQSBSb290IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTI1MDMxODE4MjAw
NVoXDTQwMDMxNDE4MjAwNVowUDELMAkGA1UEBhMCR1IxFTATBgNVBAoMDHd3V2Fs
bGV0Lm9yZzEqMCgGA1UEAwwhSUFDQSBSb290IENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBbRJ1h/gO3abjm3unzpBVNErW
V+vRfE06RYjF3U8kP1k2BbcRCyUT89Uc71AleLpDiJVd7cwnEdxa2I8vqhEQ/O0A
sNeO3BTKzrJ4eSHJNPz6ifVq9DkfAQPQaTLH9YjqPxOOq9WXNe47KlOXO+j8q7Yl
m8lgwoR8R6wK6vuYe18fmlWjga8wgawwHQYDVR0OBBYEFLU7Y3gq60G6n1qs9IuB
VTB3E8/lMA4GA1UdDwEB/wQEAwIBBjAyBgNVHRIEKzApgRFpbmZvQHd3d2FsbGV0
Lm9yZ4YUaHR0cHM6Ly93d1dhbGxldC5vcmcwEgYDVR0TAQH/BAgwBgEB/wIBADAz
BgNVHR8ELDAqMCigJqAkhiJodHRwczovL3d3V2FsbGV0Lm9yZy9jZXJ0L2lhY2Ev
Y3JsMAoGCCqGSM49BAMEA4GMADCBiAJCAJgWmaGpY5/YcFFUnJZIQI8YFs2ypUDz
O3HqHZ5sKbEZA2gfr9F1InLk5RVFQufbVrT0RfsmdSluUD5/IeKlvqMPAkIA3nyw
yqRqcu1v7esbEjuEOrHaBC82B2XTeWlGhJOlOUPqF+qPiFT5Xyuw2Vm5uQX1Bl7z
Bf0+OmVQVmW9uegVeKw=
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