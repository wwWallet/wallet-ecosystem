import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialMsoMdoc } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialMsoMdoc";
import { PIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM";
import { PorSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/PorSupportedCredentialSdJwt";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwt());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


