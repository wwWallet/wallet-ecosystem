
export type SimpleDiplomaCredentialSubject = {
	id?: string;
	firstName?: string;
	familyName?: string;
	diplomaTitle?: string;
	grade?: string;
	eqfLevel?: string;
	certificateId?: string;
	dateOfBirth?: string;
	awardingDate?: string;
	completionDate?: string;
}


export class SimpleDiplomaCredentialSubjectBuilder {
	credentialSubject: SimpleDiplomaCredentialSubject = {};


	setId(id: string): this {
		this.credentialSubject.id = id;
		return this;
	}

	setFirstName(firstName: string): this {
		this.credentialSubject.firstName = firstName;
		return this;
	}

	setFamilyName(familyName: string): this {
		this.credentialSubject.familyName = familyName;
		return this;
	}

	setDiplomaTitle(diplomaTitle: string): this {
		this.credentialSubject.diplomaTitle = diplomaTitle;
		return this;
	}

	setGrade(grade: string): this {
		this.credentialSubject.grade = grade;
		return this;
	}

	setLevel(level: string): this { 
		this.credentialSubject.eqfLevel = level;
		return this;
	}

	setCertificateId(certificateId: string): this {
		this.credentialSubject.certificateId = certificateId;
		return this;
	}

	setDateOfBirth(dateOfBirth: string): this {
		this.credentialSubject.dateOfBirth = dateOfBirth;
		return this;
	}

	setAwardingDate(awardingDate: string): this {
		this.credentialSubject.awardingDate = awardingDate;
		return this;
	}

	setCompletionDate(completionDate: string): this {
		this.credentialSubject.completionDate = completionDate;
		return this;
	}

	build(): SimpleDiplomaCredentialSubject { 
		return this.credentialSubject;
	}
}