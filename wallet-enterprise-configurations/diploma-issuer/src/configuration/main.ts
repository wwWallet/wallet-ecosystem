import { EdiplomasBlueprintSdJwt } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwt";
import { credentialConfigurationRegistryService } from "../services/instances";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwt());
}