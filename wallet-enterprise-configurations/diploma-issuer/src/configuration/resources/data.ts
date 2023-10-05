

type DiplomaEntry = {
	blueprintID: string;
	certificateId: string;
	firstName: string;
	familyName: string;
	title: string;
	institutionCode: string;
	institutionName: string;
	grade: string;
	ssn: string;
	level: string;
	dateOfBirth: string;
	completionDate: string;
	awardingDate: string;
}

type VIDEntry = {
	personalIdentifier: string;
	firstName: string;
	familyName: string;
	taxisId: string;	
	birthdate: string;
}

const diplomasRepository: DiplomaEntry[] = [
	{
		blueprintID: "46",
		certificateId: "1",
		firstName: "George",
		familyName: "Dokimastikos",
		title: "Informatics and Telecommunications",
		ssn: "032429484252432",
		institutionCode: "uoa",
		institutionName: "National and Kapodistrian University of Athens",
		grade: "8.1",
		level: "6",
		dateOfBirth: "1990-07-01",
		completionDate: "2020-09-01",
		awardingDate: "2020-06-01",
	},
	{
		blueprintID: "75",
		certificateId: "1233314134",
		firstName: "George",
		familyName: "Dokimastikos",
		title: "Physics",
		ssn: "032429484252432",
		institutionCode: "uoa",
		institutionName: "National and Kapodistrian University of Athens",
		grade: "9.0",
		level: "6",
		dateOfBirth: "1990-07-01",
		completionDate: "2020-09-01",
		awardingDate: "2020-06-01",
	}
]



async function getDiplomasBySSNAndBlueprintID(ssn: string, blueprintID: string) {
	return diplomasRepository.filter(d => d.ssn == ssn && d.blueprintID == blueprintID);
}





export { 
	getDiplomasBySSNAndBlueprintID,
	DiplomaEntry,
	VIDEntry
}