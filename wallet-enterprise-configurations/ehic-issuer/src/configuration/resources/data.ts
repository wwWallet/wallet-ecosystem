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

type PDA1Entry = {
	personalIdentifier: string;
	firstName: string;
	familyName: string;
	taxisId: string;
	ssn: string;
	birthdate: string;
}

const ehicRepository: PDA1Entry[] = [
	{
		personalIdentifier: "032429484252432",
		firstName: "John",
		familyName: "Doe",
		taxisId: "432432432423",
		ssn: "032429484252432",
		birthdate: "18-5-1990"
	}
]

async function getVIDByTaxisId(taxisid: string) {
	return vidRepository.filter(s => s.taxisId == taxisid)[0];
}

async function getEhic(ssn: string) {
	return ehicRepository.filter(s => s.ssn == ssn)[0]
}


export { 
	getVIDByTaxisId,
	getEhic,
	VIDEntry,
	PDA1Entry
}