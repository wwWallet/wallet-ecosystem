const locale = {
	en: {
		ReturnToMainPage: "Return",
		header: {
			title: "EHIC Issuer",
			subtitle: "Receive your verifiable EHIC Card",
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
			header: "EHIC Issuer",
			phrase: "I want to receive an EHIC Card",
			proceed: "Proceed",
			heading: "EHIC Card Issuer",
			paragraph: "This is a portal where citizens can receive their digital EHIC Card in their wallet. To proceed you must first have an EBSI conformant digital wallet. This Verifiable EHIC Card will contain a the Social Security Number as a personal identifier.",
			demo_text: "This is an Issuer implementation for demonstration purposes. It has been developed in the framework of EBSI Early Adopters Program and the Multi University Pilot, with the endorsement of the Greek Ministry of Education. The purpose of this application is to issue a Verifiable Credential containing the attributes of an EHIC Card."
		},
		VIDAuthenticationComponent: {
			title: "Authenticate using VID"
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
			label: "Choose between authenticating via presenting a Verifiable ID or via a conventional 3rd-party authentication service (e.g., National Authentication Service, Google):",
		}
	}
}

export default locale;