#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const issuersTrustedRootCert = `MIIB3DCCAYECFHBDWpkLi64f5ZrF0xuytj5PIrbqMAoGCCqGSM49BAMCMHAxCzAJBgNVBAYTAkdSMQ8wDQYDVQQIDAZBdGhlbnMxEDAOBgNVBAcMB0lsbGlzaWExETAPBgNVBAoMCHd3V2FsbGV0MREwDwYDVQQLDAhJZGVudGl0eTEYMBYGA1UEAwwPd3d3YWxsZXQtaXNzdWVyMB4XDTI0MDkyNjA4MTQxMloXDTM0MDkyNDA4MTQxMlowcDELMAkGA1UEBhMCR1IxDzANBgNVBAgMBkF0aGVuczEQMA4GA1UEBwwHSWxsaXNpYTERMA8GA1UECgwId3dXYWxsZXQxETAPBgNVBAsMCElkZW50aXR5MRgwFgYDVQQDDA93d3dhbGxldC1pc3N1ZXIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQtY9kUQFfDf6iocFE4rRvy3GMyYypqmX3ZjmwUeXJy0kkgRT73C8+WPkWNg/ydJHCEDDO5XuRaIaOHc9DpLpNSMAoGCCqGSM49BAMCA0kAMEYCIQDzw27nBr7E8N6Gqc83v/6+9izi/NEXBKlojwLJAeSlsAIhAO2JdjPEz3bD0stoWEg7RDtrAm8dsgryCy1W5BDGCVdN`;

// function copyKeys(srcPath, destPath) {
// 	const fileName = path.basename(srcPath);
// 	if (!fs.existsSync(destPath)) {
// 		fs.mkdirSync(destPath, { recursive: true });
// 	}
// 	fs.copyFileSync(srcPath, path.join(destPath, fileName));
// }

// function findFilesWithExtension(dir, extension) {
//   const files = [];
//   const items = fs.readdirSync(dir);

//   for (const item of items) {
//     const fullPath = path.join(dir, item);

//     if (fs.statSync(fullPath).isDirectory()) {
//       files.push(...findFilesWithExtension(fullPath, extension));
//     } else if (item.endsWith(extension)) {
//       files.push(fullPath);
//     }
//   }

//   return files;
// }

// function replaceTokenInTemplate(templateFile, token) {
//   const templateContent = fs.readFileSync(templateFile, 'utf8');
//   return templateContent.replace(/\${GITHUB_AUTH_TOKEN}/g, token);
// }

let args = process.argv.slice(2);
let action = args[0]; // up or down
args = args.slice(1); // get the rest of the arguments aside from action argument
let useOpenIdUrl = false;
let daemonMode = false;
let forceUpdateConfigs = false;
let useComposeTemplate = false;
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
	const firstIssuerInsertion = `INSERT INTO credential_issuer (credentialIssuerIdentifier, clientId, visible) VALUES ('http://wallet-enterprise-vid-issuer:8003', '1233', 1)`;
	const secondIssuerInsertion = `INSERT INTO credential_issuer (credentialIssuerIdentifier, clientId, visible) VALUES ('http://wallet-enterprise-diploma-issuer:8000', '213213213213', 1)`;
	const thirdIssuerInsertion = `INSERT INTO credential_issuer (credentialIssuerIdentifier, clientId, visible) VALUES ('http://wallet-enterprise-ehic-issuer:8004', '1343421314efr243', 1)`;

	const cleanupCertificateTable = `DELETE FROM trusted_root_certificate`;
	const firstCertificateInsertion = `INSERT INTO trusted_root_certificate (certificate) VALUES ('${issuersTrustedRootCert}')`;

	return execSync(`${dockerComposeCommand} exec -t wallet-db sh -c "
			mariadb -u ${dbUser} -p\\"${dbPassword}\\" wallet -e \\"${cleanupCredentialIssueTable}; ${firstIssuerInsertion}; ${secondIssuerInsertion}; ${thirdIssuerInsertion}; ${cleanupCertificateTable}; ${firstCertificateInsertion} \\"
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
	if (args.length < 1) {
		console.error("<image_tag> is required");
		console.error("Syntax: node ecosystem.js build-images <image_tag> <image name 1> <image name 2> ... <image name N>");
		process.exit();
	}

	const imageTag = args[0];


	if (args.length <= 1 || args.includes("wallet-frontend")) {
		execSync(`cd wallet-frontend && docker build -t ghcr.io/wwwallet/wallet-frontend:${imageTag} .`, { stdio: 'inherit' });
	}

	if (args.length <= 1 || args.includes("wallet-backend-server")) {
		execSync(`cd wallet-backend-server && docker build -t ghcr.io/wwwallet/wallet-backend-server:${imageTag} .`, { stdio: 'inherit' });
	}
	
	if (args.length <= 1 || args.includes("vid-issuer")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ghcr.io/wwwallet/wallet-enterprise-vid-issuer:${imageTag} -f wallet-enterprise-configurations/vid-issuer/Dockerfile .`, { stdio: 'inherit' });
	}

	if (args.length <= 1 || args.includes("ehic-issuer")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ghcr.io/wwwallet/wallet-enterprise-ehic-issuer:${imageTag} -f wallet-enterprise-configurations/ehic-issuer/Dockerfile .`, { stdio: 'inherit' });
	}

	if (args.length <= 1 || args.includes("diploma-issuer")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ghcr.io/wwwallet/wallet-enterprise-diploma-issuer:${imageTag} -f wallet-enterprise-configurations/diploma-issuer/Dockerfile .`, { stdio: 'inherit' });
	}

	if (args.length <= 1 || args.includes("acme-verifier")) {
		execSync(`cd wallet-enterprise && docker build -t ghcr.io/wwwallet/wallet-enterprise:base -f base.Dockerfile .`, { stdio: 'inherit' });
		execSync(`docker build -t ghcr.io/wwwallet/wallet-enterprise-acme-verifier:${imageTag} -f wallet-enterprise-configurations/acme-verifier/Dockerfile .`, { stdio: 'inherit' });
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
