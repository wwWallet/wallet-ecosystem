import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { AuthenticationMethodSelectionComponent } from "./AuthenticationMethodSelectionComponent";
import { GenericVIDAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericVIDAuthenticationComponent";
import path from "path";
import { parseEhicData } from "../datasetParser";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
// import { ClientSelectionComponent } from "./ClientSelectionComponent";


const datasetName = "ehic-dataset.xlsx"


parseEhicData(path.join(__dirname, "../../../../dataset/" + datasetName)) // test parse


export const authChain = new AuthenticationChainBuilder()
	// .addAuthenticationComponent(new ClientSelectionComponent("client-selection", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new AuthenticationMethodSelectionComponent("auth-method", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new GenericVIDAuthenticationComponent("vid-authentication", CONSENT_ENTRYPOINT, {
		"family_name": { input_descriptor_constraint_field_name: "Family Name" },
		"given_name": { input_descriptor_constraint_field_name: "Given Name" },
		"birth_date": { input_descriptor_constraint_field_name: "Birth Date", parser: (value: string) => new Date(value).toISOString() },
	}))
	.addAuthenticationComponent(new GenericLocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT, {
			"family_name": { datasetColumnName: "family_name" },
			"given_name": { datasetColumnName: "given_name" },
			"birth_date": { datasetColumnName: "birth_date", parser: (value: any) => new Date(value).toISOString() },
		}, 
		async () => parseEhicData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
		[ { username: "john", password: "secret" }, { username: "emily", password: "secret" } ]
	))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();
