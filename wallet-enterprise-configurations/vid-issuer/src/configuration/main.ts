import { credentialConfigurationRegistryService } from "../services/instances";
import { VIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new VIDSupportedCredentialSdJwtVCDM());
}


