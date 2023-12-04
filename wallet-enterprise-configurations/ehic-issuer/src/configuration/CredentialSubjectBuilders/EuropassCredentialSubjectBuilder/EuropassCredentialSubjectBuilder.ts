import { LearningEntitlement } from "./LearningEntitlement/LearningEntitlementBuilder";

// Describe the Europass schema
export type Europass = {
	id: string;
	entitledTo: LearningEntitlement[];
}




export interface EuropassCredentialSubjectBuilderInterface {
	setId(id: string): this;
	addEntitlement(entitlement: LearningEntitlement): this;

	// add functions ...
	build(): Europass;
}

export class EuropassCredentialSubjectBuilder implements EuropassCredentialSubjectBuilderInterface {
	private credentialSubject: Partial<Europass> = {}

	setId(id: string): this {
		this.credentialSubject.id = id;
		return this;
	}

	addEntitlement(entitlement: LearningEntitlement): this {
		if (!this.credentialSubject.entitledTo)
			this.credentialSubject.entitledTo = [];
		this.credentialSubject.entitledTo.push(entitlement);
		return this;
	}

	build(): Europass {
		return this.credentialSubject as Europass;
	}
	
}
