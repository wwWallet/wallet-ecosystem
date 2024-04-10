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
    return VerifiableCredentialFormat.VC_SD_JWT;
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
			return null;
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
			"id": `urn:certificateId:${diploma.certificateId}`,
			"name": "Greek HEI Diploma",  // https://www.w3.org/TR/vc-data-model-2.0/#names-and-descriptions
			"description": "This diploma serves as evidence of successful completion of a Bachelor's program at a Greek university.",
			"credentialSubject": {
				"id": holderDID,
				"firstName": diploma.firstName,
				"familyName": diploma.familyName,
				"dateOfBirth": diploma.dateOfBirth,
				"grade": diploma.grade,
				"eqfLevel": diploma.eqfLevel,
				"diplomaTitle": diploma.diplomaTitle,
				"certificateId": diploma.certificateId,
				"blueprintId": this.blueprintID,
				"completionDate": diploma.completionDate,
				"awardingDate": diploma.awardingDate,
				"achievement": {
					"name": "Systems Programming",
					"description": "This course examines in depth the Unix environment as a development environment. We will look at the Linux API for the C / C ++ languages as well as the Linux shell. We will cover topics such as: basic Unix commands, shell programming, script languages, programming of system functions in C / C ++ for error handling, creation and termination of processes, sending / receiving signals, low-level input / output system calls, communication between local processes, creation, termination and synchronization of threads, file system management, as well as network programming. This course requires independent and consistent effort from the student.",
					"type": "Compulsory",
					"image": config.url + "/images/EuropassUoaCard.png"
				},
			},
			"credentialBranding": {
				"image": {
					"url": config.url + "/images/EuropassUoaCard.png"
				},
				"backgroundColor": "#8ebeeb",
				"textColor": "#ffffff"
			},
		};

		const disclosureFrame = {
			vc: {
				credentialSubject: {
					dateOfBirth: true,
					grade: true,
					eqfLevel: true,
					diplomaTitle: true,
					blueprintId: true,
					completionDate: true,
					awardingDate: true,
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

