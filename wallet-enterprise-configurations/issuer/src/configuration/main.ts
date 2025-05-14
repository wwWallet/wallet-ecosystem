import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialMsoMdoc } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialMsoMdoc";
import { PIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialSdJwtVCDM_1_5 } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM_1_5";
import { PorSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/PorSupportedCredentialSdJwt";
import { MasterBlueprintSdJwtVCDM} from "./SupportedCredentialsConfiguration/MasterBlueprintSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM_1_5());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwt());
	credentialConfigurationRegistryService.register(new MasterBlueprintSdJwtVCDM());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


