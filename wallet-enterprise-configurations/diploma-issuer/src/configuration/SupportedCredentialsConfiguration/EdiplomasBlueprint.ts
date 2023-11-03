import config from "../../../config";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { getDiplomasBySSN } from "../resources/data";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { SignVerifiableCredentialJWT } from "@wwwallet/ssi-sdk";
import { keystoreService } from "../../services/instances";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { SimpleDiplomaCredentialSubjectBuilder } from "../CredentialSubjectBuilders/SimpleDiplomaCredentialSubjectBuilder/SimpleDiplomaCredentialSubjectBuilder";


export class EdiplomasBlueprint implements SupportedCredentialProtocol {


  constructor(private credentialIssuerConfig: CredentialIssuer,
		private blueprintID: string) { }

  getCredentialIssuerConfig(): CredentialIssuer {
    return this.credentialIssuerConfig;
  }
  getId(): string {
    return "urn:credential:ediplomas:blueprint:" + this.blueprintID;
  }
  getFormat(): VerifiableCredentialFormat {
    return VerifiableCredentialFormat.JWT_VC_JSON;
  }
  getTypes(): string[] {
    return ["VerifiableCredential", "VerifiableAttestation", "Bachelor", this.getId()];
  }
  getDisplay(): Display {
		return {
			name: "Bachelor Diploma",
			logo: { url: config.url + "/images/EuropassUoaCard.png" },
			background_color: "#4CC3DD"
		}
  }


  async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
    if (!userSession?.ssn) {
      return null;
    }


		const diplomaEntries = await getDiplomasBySSN(userSession.ssn);
		if (diplomaEntries.length == 0) {
			throw new Error("No diploma entries found");
		}
		const diplomaEntry = diplomaEntries[0];
		if (!diplomaEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}
		const credentialView: CredentialView = {
			credential_id: diplomaEntry.certificateId,
			deferredFlow: false,
			credential_supported_object: this.exportCredentialSupportedObject(),
			view: {
				rows: [
					{ name: "First Name", value: diplomaEntry.firstName },
					{ name: "Family Name", value: diplomaEntry.familyName },
					{ name: "Title", value: diplomaEntry.title },
					{ name: "Grade", value: diplomaEntry.grade },
				]
			}
		};
		return credentialView;
  }
  
  async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any;  }> {
		if (!userSession.ssn) {
			throw new Error("Cannot generate credential: Taxis id is missing");
		}
		
		const diplomaEntries = await getDiplomasBySSN(userSession.ssn);
		if (diplomaEntries.length == 0) {
			throw new Error("No diploma entries found");
		}
		const diplomaEntry = diplomaEntries[0];
		if (!diplomaEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}

		const diploma: CredentialSubject = new SimpleDiplomaCredentialSubjectBuilder()
			.setId(diplomaEntry.certificateId)
			.setFirstName(diplomaEntry.firstName)
			.setFamilyName(diplomaEntry.familyName)
			.setGrade(diplomaEntry.grade)
			.setLevel(diplomaEntry.level)
			.setDiplomaTitle(diplomaEntry.title)
			.setCertificateId(diplomaEntry.certificateId)
			.build();

    const nonSignedJwt = new SignVerifiableCredentialJWT()
      .setJti(diplomaEntry.certificateId)
			.setSubject(holderDID)
      .setIssuedAt()
      .setExpirationTime('1y')
      .setContext([])
      .setType(this.getTypes())
      .setCredentialSubject(diploma)
      .setCredentialSchema("https://api-pilot.ebsi.eu/trusted-schemas-registry/v1/schemas/0x4dd3926cd92bb3cb64fa6c837539ed31fc30dd38a11266a91678efa7268cde09");    

		const { credential } = await keystoreService.signVcJwt(this.getCredentialIssuerConfig().walletId, nonSignedJwt);
    const response = {
      format: this.getFormat(),
      credential: credential
    };

    return response;
  }

	exportCredentialSupportedObject(): CredentialSupportedJwtVcJson {
		return {
			id: this.getId(),
			format: this.getFormat(),
			display: [ this.getDisplay() ],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

