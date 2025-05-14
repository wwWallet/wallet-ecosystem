const locale = {
	en: {
		header: {
			title: "wwWallet Issuer",
			subtitle: "Receive your PID",
		},
		plainHeader: {
			title: "National Authentication Service",
			subtitle: "User Authentication"
		},
		footer: {
			services: "Services",
			documentation: "Documentation",
			adminLogin: "Verifier Panel",
			information: "Information",
			participatingInst: "Participating Institutions",
			termsOfUse: "Terms of Use",
			contact: "Contact",
			web: "Web",
			emailForOrgs: "E-mail for Institutions"
		},
		index: {
			header: "wwWallet Issuer",
			phrase: "I want to receive a",
			proceed: "Proceed",
			heading: "wwWallet Issuer",
			paragraph: "The Demo wwWallet Issuer is a proof-of-concept service designed to issue verifiable credentials (VCs) in SD-JWT or mdoc formats, supporting the wwWallet ecosystem. It provides demonstrative credentials, including Personal Identification (PID), European Health Insurance Card (EHIC), Bachelor Diploma and Power of Representation VCs, strictly for testing purposes (not valid for real-world use).",
			demoText: "This issuer follows OpenID4VCI (draft 14) for credential issuance, implementing the authorization_code grant with scope, client_id, state, and PKCE, and supports OpenID for Verifiable Presentations (draft 21) for secure VC verification. It enables developers and stakeholders to explore interoperability and real-world scenarios in digital identity and trust frameworks.",
			metadata: "The issuer's metadata is available at",
			sdJwtMetadata: "and the JWT VC Issuer Metadata configuration can be found at",
			specs: {
				paragraph: "The specifications that are partially or fully implemented by wwWallet Issuer are shown below:",
				tables: {
					openid4vci: [
						["Grant Type", "authorization_code [OpenID.Core]"],
						["Client Authentcation", "PKCE [RFC 7636], no secret"],
						["Client Type", "Public"],
						["Dynamic Credential Request", "OpenID4VP, OAuth 2.0 for First-Party Applications"],
						["Scope", "Required"],
						["Authorization Method", "Pushed Authorization Request [RFC 9126]"],
						["Access Token", "DPoP Token [RFC 9449]"],
						["Credential Endpoint Proof Type", "jwt [OpenID4VCI]"],
						["Credential Response Holder Binding", "cnf claim [RFC 7800]"],
						["Batch Credential Endpoint", "Supported"],
						["Credential Format", "vc+sd-jwt, mso_mdoc"],
					],
					openid4vci_notes: "Currently, the Notification and Deferred Endpoints are not supported",
					openid4vp: [
						["Response Mode", "direct_post.jwt [OpenID4VP]"],
						["Request Method", "request_uri signed [JAR]"],
						["Client ID Scheme", "x509_san_dns"],
						["Credential Format", "vc+sd-jwt, mso_mdoc"],
					],
					openid4vp_notes: "",
				},
				iacas: {
					paragraph: "The Root CA certificate which was used to sign the issuer's certificate is available in the following url"
				}
			},
			typeMetatadaExamplesHeader: "JWT VC Type Metadata Examples",
			typeMetatadaExamples: [
				["Pid (ARF 1.5)", "pid/person-identification-data-arf-15-vctm-example-01.json"],
				["Pid (ARF 1.8)", "pid/person-identification-data-arf-18-vctm-example-01.json"],
				["EHIC", "ehic/european-health-insurance-card-vctm-dc4eu-01.json"],
				["PDA1", "pda1/portable-document-a1-vctm-dc4eu-01.json"],
				["POR", "por/power-of-representation-vctm-potential-01.json"],
			],
		},
		VIDAuthenticationComponent: {
			title: "Authenticate using Digital Credentials"
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
		},
		AuthenticationMethodComponent: {
			title: "Authentication Method",
			label: "Choose between authenticating via presenting a PID or via a conventional 3rd-party authentication service (e.g., National Authentication Service, Google):",
		},
		personalInfo: {
			title: "Personal Identifiable Information",
			subtitle: "Please review the following personal identifiable information (PII) that has been retrieved for you by the National Authentication Service.",
			acknowledgement: "By continuing, you acknowledge that the information is correct and that you agree with its use for the retrieval of your University Degrees.",
			back: "Back",
			proceed: "Confirm and Proceed",
			given_name: "Given Name",
			family_name: "Family Name",
			ssn: "Social Security Number",
			taxisId: "Tax Identification",
			document_number: "Document Number",
		},
	}
}

export default locale;