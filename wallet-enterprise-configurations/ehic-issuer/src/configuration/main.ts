import { credentialConfigurationRegistryService } from "../services/instances";
import { EHICSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwt";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwt());
}