import { credentialConfigurationRegistryService } from "../services/instances";
import { VIDSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialSdJwt";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new VIDSupportedCredentialSdJwt());
}


