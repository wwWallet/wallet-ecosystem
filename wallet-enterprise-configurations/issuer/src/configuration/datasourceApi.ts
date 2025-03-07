import { config } from "../../config";
import axios from "axios";


type DatasourceApiFetchResponse = {
	datasourceEntityId: "wwwallet-por",
	data: Array<{
		id: number;
	}>;
}

export function DatasourceApi() {
	// @ts-ignore
	const { url, access_token } = config.issuanceFlow;
	const configurations = {
		"wwwallet-por": {
			url: `${url}/wwwallet-por`,
		}
	};

	return {
		fetch: async (datasourceEntityId: "wwwallet-por"): Promise<[DatasourceApiFetchResponse | null, Error | null]> => {
			const conf = configurations[datasourceEntityId];
			const { url } = conf;
			let array = [];
			try {
				const result = await axios.get(url, {
					headers: {
						authorization: `Bearer ${access_token}`,
					}
				});
				array = result.data as Array<any>;
			}
			catch (err) {
				if (err instanceof Error) {
					return [null, err];
				}
				throw err;
			}

			return [{ datasourceEntityId, data: array }, null];

		}
	}
}