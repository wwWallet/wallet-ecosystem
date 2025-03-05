const locale = {
	en: {
		header: {
			title: "wwWallet Issuer",
			subtitle: "Receive your verifiable ID",
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
			paragraph: "This is a portal where citizens can receive their digital Verifiable ID in their wallet. To proceed you must first have an EBSI conformant digital wallet. This Verifiable ID will contain a the Social Security Number as a personal identifier.",
			demo_text: "This is a National VID implementation for demonstration puproses. It has been developed in the framework of EBSI Early Adopters Program and the Multi University Pilot, with the endorsement of the Greek Ministry of Education. The purpose of this application is to issue a Verifiable ID for authentication puproses."
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