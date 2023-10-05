

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
		firstName: "John",
		familyName: "Doe",
		title: "Informatics and Telecommunications",
		ssn: "032429484252432",
		institutionCode: "uoa",
		institutionName: "National and Kapodistrian University of Athens",
		grade: "8.1",
		level: "6"
	},
	{
		blueprintID: "75",
		certificateId: "1233314134",
		firstName: "John",
		familyName: "Doe",
		title: "Physics",
		ssn: "032429484252432",
		institutionCode: "uoa",
		institutionName: "National and Kapodistrian University of Athens",
		grade: "9.0",
		level: "6"
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