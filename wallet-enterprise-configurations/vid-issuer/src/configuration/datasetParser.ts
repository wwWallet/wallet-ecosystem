import * as XLSX from 'xlsx';
import fs from 'fs';

export function parsePidData(filePath: string) {
	try {
		const readOpts: XLSX.ParsingOptions = {
			cellText: false, 
			cellDates: true,
			type: 'buffer'
		};
		const fileBuffer = fs.readFileSync(filePath);
	
		// Parse the workbook
		const workbook = XLSX.read(fileBuffer, readOpts);
		
		const sheetName = "PID"
		// Get the first worksheet
		const worksheet = workbook.Sheets[sheetName];

		// Convert worksheet to JSON format
		let data: any[] = XLSX.utils.sheet_to_json(worksheet, {
			defval: null,
			dateNF: 'd"/"m"/"yyyy'
			// skipHidden: true,
			// header: 0
		});
	
		if (data.length == 0) {
			throw new Error("Empty dataset");
		}


		data = data.map((row) => {
			return {
				...row,
				pid_id: String(row.pid_id)
			}
		});
		return data;
	}
	catch(err) {
		console.error(err);
		return null;
	}

}