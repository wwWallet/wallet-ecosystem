#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyKeys(srcPath, destPath) {
	const fileName = path.basename(srcPath);
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath, { recursive: true });
	}
	fs.copyFileSync(srcPath, path.join(destPath, fileName));
}

function findFilesWithExtension(dir, extension) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...findFilesWithExtension(fullPath, extension));
    } else if (item.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function replaceTokenInTemplate(templateFile, token) {
  const templateContent = fs.readFileSync(templateFile, 'utf8');
  return templateContent.replace(/\${GITHUB_AUTH_TOKEN}/g, token);
}

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
		console.log("Wallet URL is now openid:// in all configurations");
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

const githubTokenFile = '.github-token';
let githubToken;

try {
  githubToken = fs.readFileSync(githubTokenFile, 'utf8').trim();
  fs.chmodSync(githubTokenFile, 0o600);
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(`Write GitHub token to '${githubTokenFile}' before running this script.`);
  process.exit(1);
}

if (fs.existsSync(githubTokenFile)) {
  const npmrcTemplateFiles = findFilesWithExtension('.', '.npmrc.template');
  for (const npmrcTemplateFile of npmrcTemplateFiles) {
    const npmrcFile = npmrcTemplateFile.replace('.template', '');

    if (!fs.existsSync(npmrcFile) || forceUpdateConfigs) {
      fs.writeFileSync(npmrcFile, '', { mode: 0o600 });
      fs.writeFileSync(npmrcFile, replaceTokenInTemplate(npmrcTemplateFile, githubToken));
    }
  }
} else {
  console.error(`Error: No such file: ${githubTokenFile}`);
  console.error(`Write GitHub token to '${githubTokenFile}' before running this script.`);
  process.exit(1);
}

// MariaDB configuration
const dbHost = 'wallet-db';
const dbPort = 3307;
const dbUser = 'root';
const dbPassword = 'root';


if (!fs.existsSync(`${process.cwd()}/docker-compose.yml`) || useComposeTemplate) {
	fs.copyFileSync('docker-compose.template.yml', 'docker-compose.yml');
}

if (useOpenIdUrl) {
	walletClientUrl = "openid://cb";
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

function init() {
	return execSync(`${dockerComposeCommand} run --rm -t --workdir /app/cli --env NODE_PATH=/cli_node_modules wallet-backend-server sh -c '
		set -e # Exit on error
		export DB_HOST="wallet-db"
		export DB_PORT="3307"
		export DB_USER="root"
		export DB_PASSWORD="root"
		export DB_NAME="wallet"
		./configwallet.js create issuer \
			--friendlyName "National VID Issuer" \
			--url http://wallet-enterprise-vid-issuer:8003 \
			--did did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt \
			--client_id did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt
		./configwallet.js create issuer \
			--friendlyName "University of Athens" \
			--url http://wallet-enterprise-diploma-issuer:8000/uoa \
			--did did:ebsi:zpq1XFkNWgsGB6MuvJp21vA \
			--client_id did:ebsi:zpq1XFkNWgsGB6MuvJp21vA
		./configwallet.js create issuer \
			--friendlyName "EHIC Issuer" \
			--url http://wallet-enterprise-ehic-issuer:8004 \
			--did did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt3 \
			--client_id did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt3
	'`, { stdio: 'inherit' });
}

if (action !== 'up') {
	console.log("Error: First argument must be 'up' or 'down' or 'init'");
	help();
	process.exit();
}


{ // wallet backend server configuration
	const configPath = 'wallet-backend-server/config/config.development.ts';
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
