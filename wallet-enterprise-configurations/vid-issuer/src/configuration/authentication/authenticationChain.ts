import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { GenericLocalAuthenticationComponent } from "../../authentication/authenticationComponentTemplates/GenericLocalAuthenticationComponent";
import { parsePidData } from "../datasetParser";
import path from "path";


const datasetName = "vid-dataset.xlsx";



export const authChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new GenericLocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT, {
		"pid_id": { datasetColumnName: "pid_id", parser: (val: any) => String(val) },
	},
		async () => parsePidData(path.join(__dirname, "../../../../dataset/" + datasetName)) as any[],
		[{ username: "john", password: "secret" }, { username: "emily", password: "secret" }]
	))
	// .addAuthenticationComponent(new LocalAuthenticationComponent2("2-local", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();