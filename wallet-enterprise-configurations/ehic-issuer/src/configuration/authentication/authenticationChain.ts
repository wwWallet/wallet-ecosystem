import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { LocalAuthenticationComponent } from "./LocalAuthenticationComponent";
import { VIDAuthenticationComponent } from "./VIDAuthenticationComponent";
import { AuthenticationMethodSelectionComponent } from "./AuthenticationMethodSelectionComponent";
// import { ClientSelectionComponent } from "./ClientSelectionComponent";





export const authChain = new AuthenticationChainBuilder()
	// .addAuthenticationComponent(new ClientSelectionComponent("client-selection", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new AuthenticationMethodSelectionComponent("auth-method", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new VIDAuthenticationComponent("vid-authentication", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new LocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();