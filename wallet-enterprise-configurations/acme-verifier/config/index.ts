
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
	display: [],
	issuanceFlow: {
		skipConsent: false,
		defaultCredentialConfigurationIds: [],
	},
	presentationFlow: {
		response_mode: "direct_post.jwt"
	},
	appType: 'VERIFIER', //ISSUER,VERIFIER
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
	sessionIdCookieConfiguration: {
		maxAge: 900000, // 15-mins
		secure: false
	},
	clockTolerance: 60,
	siteConfig: {
		"name": "ACME Verifier",
		"short_name": "ACME Verifier",
		"theme_color": "#4d7e3e",
		"background_color": "#4d7e3e",
	}
}