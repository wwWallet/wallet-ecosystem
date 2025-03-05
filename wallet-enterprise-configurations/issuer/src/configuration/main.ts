import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { VIDSupportedCredentialMsoMdoc } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialMsoMdoc";
import { VIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/VIDSupportedCredentialSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new VIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new VIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


