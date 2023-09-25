import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
// import { EdiplomasAuthenticationComponent } from "./EdiplomasAuthenticationComponent";
import { LocalAuthenticationComponent } from "./LocalAuthenticationComponent";





export const authChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new LocalAuthenticationComponent("1-ediplomas", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();