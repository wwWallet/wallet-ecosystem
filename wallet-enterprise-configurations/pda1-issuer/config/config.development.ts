
export = {
	url: "http://wallet-enterprise-pda1-issuer:8006",
	port: "8006",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "pda1issuer"
	},
	wwwalletURL: "http://localhost:3000/cb",
	resourcesVaultService: {
		url: "http://resources-vault:6555"
	},
	crl: {
		url: "http://credential-status-list:9001",
		credentials: {
			basicToken: "U0RGRUoyM05KNDNOMkpFTlNBS05LSkROZHNBU0FERk5TS0pkc2FuZGtzZmpzZjoyMTMyMTMyMTNBU0tETWtzYWRzZmRkc2tqZm5GS0xTREFGSlNGU0RTREZTRkQK"
		}
	}
}