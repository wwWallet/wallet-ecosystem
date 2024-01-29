import { CONSENT_ENTRYPOINT, VERIFIER_PANEL_ENTRYPOINT } from "../../authorization/constants";
import { AuthenticationChainBuilder } from "../../authentication/AuthenticationComponent";
import { LocalAuthenticationComponent } from "./LocalAuthenticationComponent";
import { VerifierAuthenticationComponent } from "./VerifierAuthenticationComponent";
import { IssuerSelectionComponent } from "./IssuerSelectionComponent";


export const authChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new LocalAuthenticationComponent("1-local", CONSENT_ENTRYPOINT))
	.addAuthenticationComponent(new IssuerSelectionComponent("2-issuer-selection", CONSENT_ENTRYPOINT))
	.build();

export const verifierPanelAuthChain = new AuthenticationChainBuilder()
	.addAuthenticationComponent(new VerifierAuthenticationComponent("vid-verifier", VERIFIER_PANEL_ENTRYPOINT))
	.build();