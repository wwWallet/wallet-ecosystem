
export = {
	url: "https://university-ebsi.ediplomas.gr",
	port: "8003",
	appSecret: "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer",
	db: {
		host: "wallet-db",
		port: "3307",
		username: "root",
		password: "root",
		dbname: "vidissuer"
	},
	redis: {
		url: "redis://wallet-cache"
	},
	walletClientUrl: "http://localhost:3000/cb",
	walletCore: {
		url: "http://127.0.0.1:9000"
	}
}