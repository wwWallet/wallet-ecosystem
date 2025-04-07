
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
MIICCTCCAa+gAwIBAgIUOgCPRPz+xuyaJVSj4+pw5DL2pcswCgYIKoZIzj0EAwIw
UjELMAkGA1UEBhMCR1IxDzANBgNVBAgMBkdyZWVjZTEPMA0GA1UEBwwGQXRoZW5z
MQ4wDAYDVQQKDAVHVW5ldDERMA8GA1UEAwwId3dXYWxsZXQwHhcNMjUwMjI2MTUx
MjIwWhcNMzUwMjI0MTUxMjIwWjBSMQswCQYDVQQGEwJHUjEPMA0GA1UECAwGR3Jl
ZWNlMQ8wDQYDVQQHDAZBdGhlbnMxDjAMBgNVBAoMBUdVbmV0MREwDwYDVQQDDAh3
d1dhbGxldDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABNBZtjDVXcHAETA8F1Wj
ScHMtRtfNgYZxYb+6Q5qrOBBRpT75BvaANNoASnnXSXe8HJ4HCB9XG6UuuIhuK/X
eUejYzBhMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQW
BBR8ePhvPK+ji6cfKwa36k1rRewFojAfBgNVHSMEGDAWgBR8ePhvPK+ji6cfKwa3
6k1rRewFojAKBggqhkjOPQQDAgNIADBFAiEAiVcSsLpcK6bkYkq03gzejgBQvvKv
nLP+NsILFBXC+I8CIHSpT1vB/tMaJKbIizZwxyOru6N/iUkpHGzVnxU5Wgu4
-----END CERTIFICATE-----`
	],
	clockTolerance: 60,
	siteConfig: {
		"name": "wwWallet Issuer",
		"short_name": "wwWallet Issuer",
		"theme_color": "#353f55",
		"background_color": "#353f55",
	}
}