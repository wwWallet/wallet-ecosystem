import config from "../../../config";
import { CategorizedRawCredentialView, CategorizedRawCredentialViewRow } from "../../openid4vci/Metadata";
import { VerifiableCredentialFormat, Display, CredentialSupportedJwtVcJson } from "../../types/oid4vci";
import { CredentialSubject } from "../CredentialSubjectBuilders/CredentialSubject.type";
import { getEhic } from "../resources/data";
import { CredentialIssuer } from "../../lib/CredentialIssuerConfig/CredentialIssuer";
import { SupportedCredentialProtocol } from "../../lib/CredentialIssuerConfig/SupportedCredentialProtocol";
import { SignVerifiableCredentialJWT } from "@wwwallet/ssi-sdk";
import { keystoreService } from "../../services/instances";
import { AuthorizationServerState } from "../../entities/AuthorizationServerState.entity";
import { CredentialView } from "../../authorization/types";


export class EHICSupportedCredentialJwtVcJson implements SupportedCredentialProtocol {


	constructor(private credentialIssuerConfig: CredentialIssuer) { }

	getCredentialIssuerConfig(): CredentialIssuer {
		return this.credentialIssuerConfig;
	}
	getId(): string {
		return "urn:credential:ehic"
	}
	getFormat(): VerifiableCredentialFormat {
		return VerifiableCredentialFormat.JWT_VC_JSON;
	}
	getTypes(): string[] {
		return ["VerifiableCredential", "VerifiableAttestation", "EuropeanHealthInsuranceCard", this.getId()];
	}
	getDisplay(): Display {
		return {
			name: "EHIC Card",
			logo: { url: config.url + "/images/ehicCard.png" },
			background_color: "#4CC3DD"
		}
	}


	async getProfile(userSession: AuthorizationServerState): Promise<CredentialView | null> {
		if (!userSession?.ssn) {
			return null;
		}
		const ehics = [await getEhic(userSession?.ssn)];
		const credentialViews: CredentialView[] = ehics
			.map((ehic) => {
				const rows: CategorizedRawCredentialViewRow[] = [
					{ name: "Family Name", value: ehic.familyName },
					{ name: "First Name", value: ehic.firstName },
					{ name: "Personal Identifier", value: ehic.personalIdentifier },
					{ name: "Date of Birth", value: ehic.birthdate },
				];
				const rowsObject: CategorizedRawCredentialView = { rows };

				return {
					credential_id: this.getId(),
					credential_supported_object: this.exportCredentialSupportedObject(),
					view: rowsObject,
					deferredFlow: false,
				}
			})
		return credentialViews[0];
	}

	async generateCredentialResponse(userSession: AuthorizationServerState, holderDID: string): Promise<{ format: VerifiableCredentialFormat; credential: any; }> {
		if (!userSession.ssn) {
			throw new Error("Cannot generate credential: SSN is missing");
		}

		const ehicEntry = await getEhic(userSession?.ssn);

		if (!ehicEntry) {
			console.error("Possibly raw data w not found")
			throw new Error("Could not generate credential response");
		}

		const ehic: CredentialSubject = {
			familyName: ehicEntry.familyName,
			firstName: ehicEntry.firstName,
			id: holderDID,
			personalIdentifier: ehicEntry.personalIdentifier,
			dateOfBirth: ehicEntry.birthdate
		} as any;

		const nonSignedJwt = new SignVerifiableCredentialJWT()
			.setJti(ehicEntry.personalIdentifier)
			.setSubject(holderDID)
			.setIssuedAt()
			.setExpirationTime('1y')
			.setContext([])
			.setType(this.getTypes())
			.setCredentialSubject(ehic)
			.setCredentialSchema("https://");

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
			display: [this.getDisplay()],
			types: this.getTypes(),
			cryptographic_binding_methods_supported: ["ES256"]
		}
	}

}

