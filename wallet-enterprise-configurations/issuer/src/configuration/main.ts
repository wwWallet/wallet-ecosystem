import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "../credentials/SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "../credentials/SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialMsoMdoc } from "../credentials/SupportedCredentialsConfiguration/PIDSupportedCredentialMsoMdoc";
import { PIDSupportedCredentialSdJwtVCDM } from "../credentials/SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM";
import { PorSupportedCredentialSdJwt } from "../credentials/SupportedCredentialsConfiguration/PorSupportedCredentialSdJwt";
import { PorSupportedCredentialSdJwtDeferred } from "../credentials/SupportedCredentialsConfiguration/PorSupportedCredentialSdJwtDeferred";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwt());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwtDeferred());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


