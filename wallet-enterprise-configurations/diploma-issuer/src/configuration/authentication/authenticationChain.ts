import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { InspectPersonalInfoComponent } from "./InspectPersonalInfoComponent";
import { GenericVIDAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericVIDAuthenticationComponent";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
import { parseDiplomaData } from "../datasetParser";
import path from "path";
import { GenericAuthenticationMethodSelectionComponent } from "../../authentication/authenticationComponentTemplates/GenericAuthenticationMethodSelectionComponent";
import { UserAuthenticationMethod } from "../../types/UserAuthenticationMethod.enum";


const datasetName = "diploma-dataset.xlsx";
parseDiplomaData(path.join(__dirname, "../../../../dataset/" + datasetName));

export const authChain = new AuthenticationChainBuilder()
	// .addAuthenticationComponent(new ClientSelectionComponent("client-selection", CONSENT_ENTRYPOINT))
	// .addAuthenticationComponent(new AuthenticationMethodSelectionComponent("auth-method", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new GenericAuthenticationMethodSelectionComponent("auth-method", CONSENT_ENTRYPOINT, [ { code: UserAuthenticationMethod.VID_AUTH, description: "Authentication with VID" }, { code: UserAuthenticationMethod.SSO, description: "Authentication with National Services" } ]))
	.addAuthenticationComponent(new GenericVIDAuthenticationComponent("vid-auth", CONSENT_ENTRYPOINT, {
		"document_number": { input_descriptor_constraint_field_name: "Document Number", parser: (val: any) => String(val) },
	}))
	.addAuthenticationComponent(new GenericLocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT, {
		"document_number": { datasetColumnName: "vid_document_number", parser: (val: any) => String(val) },
	},
		async () => parseDiplomaData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
		[{ username: "john", password: "secret" }, { username: "emily", password: "secret" }]
	))
	.addAuthenticationComponent(new InspectPersonalInfoComponent("2-ediplomas", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();