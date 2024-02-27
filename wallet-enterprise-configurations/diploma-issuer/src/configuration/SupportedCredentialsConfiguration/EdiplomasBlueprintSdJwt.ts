import config from "../../../config";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { getDiplomasBySSNAndBlueprintID } from "../resources/data";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";
import { SimpleDiplomaCredentialSubjectBuilder } from "../CredentialSubjectBuilders/SimpleDiplomaCredentialSubjectBuilder/SimpleDiplomaCredentialSubjectBuilder";


export class EdiplomasBlueprintSdJwt implements SupportedCredentialProtocol {


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


		const diplomaEntries = await getDiplomasBySSNAndBlueprintID(userSession.ssn, this.blueprintID);
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
					{ name: "Date of birth", value: diplomaEntry.dateOfBirth },
					{ name: "Completion date", value: diplomaEntry.completionDate },
					{ name: "Awarding date", value: diplomaEntry.awardingDate },

				]
			}
		};
		return credentialView;
  }
  
  async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any;  }> {
		if (!userSession.ssn) {
			throw new Error("Cannot generate credential: Taxis id is missing");
		}
		
		const diplomaEntries = await getDiplomasBySSNAndBlueprintID(userSession.ssn, this.blueprintID);
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
			.setDateOfBirth(diplomaEntry.dateOfBirth)
			.setCompletionDate(diplomaEntry.completionDate)
			.setAwardingDate(diplomaEntry.awardingDate)
			.build();

		const payload = {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"type": this.getTypes(),
			"credentialSubject": {
				...diploma,
				"id": holderDID,
				"achievement": {
					"name": "University Degree Credential",
					"description": "A Europass Diploma issued by the University of Athens",
					"type": "Bachelor",
					"image": config.url + "/images/EuropassUoaCard.png"
				},
			},
			"name": "University Degree Credential",
			"description": "A Europass Diploma issued by the University of Athens",
			"credentialBranding": {
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
		};
		const disclosureFrame = {
			vc: {
				credentialSubject: {
					dateOfBirth: true,
					achievement: true,
					eqfLevel: true,
					diplomaTitle: true,
					completionDate: true,
					awardingDate: true,
					grade: true,
				}
			}
		}
		const { jws } = await this.getCredentialIssuerConfig().getCredentialSigner()
			.sign({
				vc: payload
			}, {}, disclosureFrame);
    const response = {
      format: this.getFormat(),
      credential: jws
    };
		console.log("JWS = ", jws)
    return response;
  }

	exportCredentialSupportedObject(): CredentialSupportedJwtVcJson {
		return {
			id: this.getId(),
			format: this.getFormat(),
			display: [ this.getDisplay() ],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["EdDSA", "ES256"]
		}
	}

}

