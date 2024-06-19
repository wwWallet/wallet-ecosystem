export = {
	url: "http://wallet-enterprise-ehic-issuer:8004",
	port: "8004",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "ehicissuer"
	},
	wwwalletURL: "http://localhost:3000/cb",
	crl: {
		url: "http://credential-status-list:9001",
		credentials: {
			basicToken: "U0RGRUoyM05KNDNOMkpFTlNBS05LSkROZHNBU0FERk5TS0pkc2FuZGtzZmpzZjoyMTMyMTMyMTNBU0tETWtzYWRzZmRkc2tqZm5GS0xTREFGSlNGU0RTREZTRkQK"
		}
	}
}