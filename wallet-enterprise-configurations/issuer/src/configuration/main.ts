import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialMsoMdoc } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialMsoMdoc";
import { PIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialSdJwtVCDM_Bud } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM_Bud";
import { PIDSupportedCredentialSdJwtVCDM_VC } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM_VC";
import { PIDSupportedCredentialSdJwtVCDM_1_5 } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM_1_5";
import { PIDSupportedCredentialSdJwtVCDM_1_5_VC } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM_1_5_VC";
import { PorSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/PorSupportedCredentialSdJwt";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM_Bud());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM_VC());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM_1_5());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM_1_5_VC());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwt());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


