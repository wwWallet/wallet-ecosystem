import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
}