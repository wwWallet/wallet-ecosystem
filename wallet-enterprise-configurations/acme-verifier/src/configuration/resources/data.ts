

type DiplomaEntry = {
	blueprintID: string;
	certificateId: string;
	firstName: string;
	familyName: string;
	title: string;
	taxisId: string;
	institutionCode: string;
	institutionName: string;
	grade: string;
	level: string;
}

type VIDEntry = {
	personalIdentifier: string;
	firstName: string;
	familyName: string;
	taxisId: string;	
	birthdate: string;
}



const vidRepository: VIDEntry[] = [
	{
		personalIdentifier: "032429484252432",
		firstName: "John",
		familyName: "Doe",
		taxisId: "432432432423",
		birthdate: "18-5-1990"
	}
]




async function getVIDByTaxisId(taxisid: string) {
	return vidRepository.filter(s => s.taxisId == taxisid)[0];
}



export { 
	getVIDByTaxisId,
	DiplomaEntry,
	VIDEntry
}