import { credentialConfigurationRegistryServiceEmitter } from "../services/CredentialConfigurationRegistryService";
import { credentialConfigurationRegistryService } from "../services/instances";
import { EdiplomasBlueprintSdJwtVCDM } from "./SupportedCredentialsConfiguration/EdiplomasBlueprintSdJwtVCDM";
import { EHICSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/EHICSupportedCredentialSdJwtVCDM";
import { PIDSupportedCredentialMsoMdoc } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialMsoMdoc";
import { PIDSupportedCredentialSdJwtVCDM } from "./SupportedCredentialsConfiguration/PIDSupportedCredentialSdJwtVCDM";
import { PorSupportedCredentialSdJwt } from "./SupportedCredentialsConfiguration/PorSupportedCredentialSdJwt";
import { MasterBlueprintSdJwtVCDM} from "./SupportedCredentialsConfiguration/MasterBlueprintSdJwtVCDM";

export async function configurationExecution() {
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PIDSupportedCredentialMsoMdoc());
	credentialConfigurationRegistryService.register(new EdiplomasBlueprintSdJwtVCDM());
	credentialConfigurationRegistryService.register(new EHICSupportedCredentialSdJwtVCDM());
	credentialConfigurationRegistryService.register(new PorSupportedCredentialSdJwt());
	credentialConfigurationRegistryService.register(new MasterBlueprintSdJwtVCDM());
	credentialConfigurationRegistryServiceEmitter.emit('initialized');
}


