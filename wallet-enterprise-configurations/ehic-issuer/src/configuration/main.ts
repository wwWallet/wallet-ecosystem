import { credentialConfigurationRegistryService } from "../services/instances";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
}