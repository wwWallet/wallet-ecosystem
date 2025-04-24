#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const issuersTrustedRootCert = `MIICMzCCAdqgAwIBAgIUdgESbTG9nxSXVImFdFHHAHGJ9RwwCgYIKoZIzj0EAwIwIDERMA8GA1UEAwwId3dXYWxsZXQxCzAJBgNVBAYTAkdSMB4XDTI1MDMwNjE1MzczM1oXDTM1MDMwNDE1MzczM1owIDERMA8GA1UEAwwId3dXYWxsZXQxCzAJBgNVBAYTAkdSMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0Fm2MNVdwcARMDwXVaNJwcy1G182BhnFhv7pDmqs4EFGlPvkG9oA02gBKeddJd7wcngcIH1cbpS64iG4r9d5R6OB8TCB7jASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUfHj4bzyvo4unHysGt+pNa0XsBaIwHwYDVR0jBBgwFoAUfHj4bzyvo4unHysGt+pNa0XsBaIwOgYDVR0fBDMwMTAvoC2gK4YpaHR0cDovL3VzZXJzLnVvYS5nci9+cHN0YW1hdG9wL2NhLWNybC5wZW0wIAYDVR0RBBkwF4YVaHR0cDovL3d3dy53YWxsZXQub3JnMCoGA1UdEgQjMCGGFWh0dHA6Ly93d3cud2FsbGV0LmNvbYIId3dXYWxsZXQwCgYIKoZIzj0EAwIDRwAwRAIgGMfgLwOXvEk0sD3nEtCuwkZRzX9vyYZ/hfg6VPrJszACIHBsYf7toXfUFjr6y1nAJ/oXP9l/fWBDydcQIq+Vnfem`;

const acmeVerifierFriendlyName = "ACME Verifier";
const acmeVerifierURL = "http://wallet-enterprise-acme-verifier:8005";

let args = process.argv.slice(2);
let action = args[0]; // up or down
args = args.slice(1); // get the rest of the arguments aside from action argument
let useOpenIdUrl = false;
let daemonMode = false;
let forceUpdateConfigs = false;
let useComposeTemplate = false;
let useWalletFrontendEnvTemplate = false;
const walletClientOrigin = "http://localhost:3000";
const walletClientUrl = `${walletClientOrigin}/cb`;

function help() {
	console.log("Usage: node ecosystem.js <up | down> <OPTIONS>");
	console.log("OPTIONS:");
	console.log("   -m                Redirection will be directed to the openid:// URL. Note: It will be applied only in the first execution of the script and every time '-c' is given");
	console.log("   -d                Start the ecosystem in daemonized mode");
	console.log("   -c                Force update of the configurations to the defaults for the development environment");
	console.log("   -t                Force the usage of the docker-compose.template.yml");
	console.log("");
	console.log("Example:");
	console.log("node ecosystem.js up -m -c");
	console.log("");
	console.log("");
}

for (const arg of args) {
	if (arg === '-t') {
		useComposeTemplate = true;
		useWalletFrontendEnvTemplate = true;
		console.log("Refreshed docker-compose.yml using the template docker-compose.template.yml");
	}

	if (arg === '-m') {
		useOpenIdUrl = true;
		console.log("Wallet URL is now openid4vp:// in all configurations");
	}

	if (arg === '-d') {
		daemonMode = true;
	}

	if (arg === '-c') {
		forceUpdateConfigs = true;
		console.log("Forcing update in configs");
	}


	if (arg === '--help') {
		help();
		process.exit();
	}
}

const secret = "dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer";

// MariaDB configuration
const dbHost = 'wallet-db';
const dbPort = 3307;
const dbUser = 'root';
const dbPassword = 'root';


if (!fs.existsSync(`${process.cwd()}/docker-compose.yml`) || useComposeTemplate) {
	fs.copyFileSync('docker-compose.template.yml', 'docker-compose.yml');
}

if (useOpenIdUrl) {
	walletClientUrl = "openid4vp://cb";
}

let dockerComposeCommand = 'docker-compose';
try {
	execSync('docker compose version').toString();
	dockerComposeCommand = 'docker compose'
} catch (error) {
	// Fall back to default value
}

if (action === "down") {
	console.log("Performing 'docker compose down'");
	// Implement the logic to stop Docker services here
	execSync(`${dockerComposeCommand} down`, { stdio: 'inherit' });
	process.exit();
}

if (action === "init") {
	console.log("Performing init");
	init()
	process.exit();
}

if (action === "build-images") {
	console.log("Performing image building");
	buildImages()
	process.exit();
}

function init() {
	const cleanupCredentialIssueTable = `DELETE FROM credential_issuer`;
	const firstIssuerInsertion = `INSERT INTO credential_issuer (credentialIssuerIdentifier, clientId, visible) VALUES ('http://wallet-enterprise-issuer:8003', '1233', 1)`;

	const cleanupCertificateTable = `DELETE FROM trusted_root_certificate`;
	const firstCertificateInsertion = `INSERT INTO trusted_root_certificate (certificate) VALUES ('${issuersTrustedRootCert}')`;


	const cleanupVerifierTable = `DELETE FROM verifier`;
	const firstVerifierInsertion = `INSERT INTO verifier (name, url) VALUES ('${acmeVerifierFriendlyName}', '${acmeVerifierURL}')`;

	return execSync(`${dockerComposeCommand} exec -t wallet-db sh -c "
			mariadb -u ${dbUser} -p\\"${dbPassword}\\" wallet -e \\"${cleanupCredentialIssueTable}; ${firstIssuerInsertion}; ${cleanupCertificateTable}; ${firstCertificateInsertion}; ${cleanupVerifierTable}; ${firstVerifierInsertion} \\"
		"`, { stdio: 'inherit' });
}

if (action !== 'up') {
	console.log("Error: First argument must be 'up' or 'down' or 'init'");
	help();
	process.exit();
}

function buildImages() {
	// syntax: node ecosystem.js build-images <image_tag> <image name 1> <image name 2> ... <image name N>
	// <image_tag> is required
	// if <image name 1> <image name 2> ... <image name N> is not provided, then all images will be built
	if (args.length < 2) {
		console.error("<image_registry> or <image_tag> is missing");
		console.error("Syntax: node ecosystem.js build-images <image_registry> <image_tag> <image name 1> <image name 2> ... <image name N>");
		process.exit();
	}

	const imageRegistry = args[0];
	const imageTag = args[1];


	if (args.length <= 2 || args.includes("wallet-frontend")) {
		execSync(`cd wallet-frontend && docker build -t ${imageRegistry}/wallet-frontend:${imageTag} .`, { stdio: 'inherit' });
	}

	if (args.length <= 2 || args.includes("wallet-backend-server")) {
		execSync(`cd wallet-backend-server && docker build -t ${imageRegistry}/wallet-backend-server:${imageTag} .`, { stdio: 'inherit' });
	}

	if (args.length <= 2 || args.includes("wallet-enterprise")) {
		execSync(`docker build -t ${imageRegistry}/wallet-enterprise:${imageTag} wallet-enterprise`, { stdio: 'inherit' });
	}

	if (args.length <= 2 || args.includes("issuer")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ${imageRegistry}/wallet-enterprise-issuer:${imageTag} -f wallet-enterprise-configurations/issuer/Dockerfile .`, { stdio: 'inherit' });
	}

	if (args.length <= 2 || args.includes("acme-verifier")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ${imageRegistry}/wallet-enterprise-acme-verifier:${imageTag} -f wallet-enterprise-configurations/acme-verifier/Dockerfile .`, { stdio: 'inherit' });
	}
}

{ // wallet frontend configuration
	const configPath = 'wallet-frontend/.env';
	const templatePath = 'wallet-frontend/.env.template';
	if (fs.existsSync(configPath) && useWalletFrontendEnvTemplate === false) {
		console.log(`${configPath} was not changed`);
	}
	else if (useWalletFrontendEnvTemplate === true) {
		fs.copyFileSync(templatePath, configPath);
	}
}


{ // wallet backend server configuration
	const configPath = 'wallet-backend-server/config/index.ts';
	const templatePath = 'wallet-backend-server/config/config.template.ts';

	if (fs.existsSync(configPath) && forceUpdateConfigs === false) {
		console.log("wallet-backend-server/config/config.development.ts was not changed");
	}
	else {
		fs.copyFileSync(templatePath, configPath);

		const servicePort = 8002;
		const serviceUrl = `http://wallet-backend-server:${servicePort}`;
		const dbName = 'wallet';
	
		let configContent = fs.readFileSync(configPath, 'utf-8');
		configContent = configContent.replace(/SERVICE_URL/g, serviceUrl);
		configContent = configContent.replace(/SERVICE_SECRET/g, secret);
		configContent = configContent.replace(/SERVICE_PORT/g, servicePort);
		configContent = configContent.replace(/DB_HOST/g, dbHost);
		configContent = configContent.replace(/DB_PORT/g, dbPort);
		configContent = configContent.replace(/DB_USER/g, dbUser);
		configContent = configContent.replace(/DB_PASSWORD/g, dbPassword);
		configContent = configContent.replace(/DB_NAME/g, dbName);
		configContent = configContent.replace(/WALLET_CLIENT_URL/g, walletClientUrl);
	
		configContent = configContent.replace(/WEBAUTHN_RP_ID/g, "localhost");
		configContent = configContent.replace(/WEBAUTHN_ORIGIN/g, walletClientOrigin);
	
		// Replacing the whole string so that the value of enabled is of type boolean and not string
		if (args.includes('--no-notifications')) {
			configContent = configContent.replace(/enabled: "NOTIFICATIONS_ENABLED"/g, 'enabled: false');
		} else {
			configContent = configContent.replace(/enabled: "NOTIFICATIONS_ENABLED"/g, 'enabled: true');
		}

		fs.writeFileSync(configPath, configContent);
	}
}

if (daemonMode === false) {
	console.log("Performing 'docker compose up'");
	execSync(`${dockerComposeCommand} up --build`, { stdio: 'inherit' });
} else {
	console.log("Performing 'docker compose up -d'");
	execSync(`${dockerComposeCommand} up --build -d`, { stdio: 'inherit' });
}
