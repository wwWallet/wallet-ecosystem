const locale = {
	en: {
		ReturnToMainPage: "Return",
		header: {
			title: "",
		},
		footer: {
			services: "Services",
			documentation: "Documentation",
			adminLogin: "Verifier Panel",
			contact: "Contact",
		},
		index: {
			header: "wwWallet Verifier",
			verifyCredential: "Verify Credential",
			heading: "wwWallet Verifier",
			oid4vpProfile: "OpenID4VP Interoperability Profile",
			openid4vp: [
				["Response Mode", "direct_post.jwt [OpenID4VP]"],
				["Request Method", "request_uri signed [JAR]"],
				["Client ID Scheme", "x509_san_dns"],
				["Credential Format", "vc+sd-jwt, mso_mdoc"],
			],
			paragraph: "This website is a proof-of-concept service designed to perform verifications of Verifiable Credentials (VCs) in SD-JWT or mDoc formats, supporting the wwWallet ecosystem. It conducts only sample verifications to showcase credential checks (not valid for real-world use).",
		},
		login: {
			title: "Login",
			description: "",
			btnText: "Login",
			error: {
				emptyUsername: "Username is empty",
				emptyPassword: "Password is empty",
				invalidCredentials: "Invalid credentials",
				networkError: "Network error occured",
			}
		}
	}
}

export default locale;