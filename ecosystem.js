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

function help() {
	console.log("Usage: node ecosystem.js <up or down> <OPTIONS>");
	console.log("OPTIONS:");
	console.log("   -m           Redirection will be directed to the openid:// URL. Note: It will be applied only in the first execution of the script and every time '-c' is given");
	console.log("   -d           Start the ecosystem in daemonized mode");
	console.log("   -c           Force update of the configurations to the defaults for the development environment");
	console.log("   -b <url>     Set the base URL");
	console.log("   -t           Force the usage of the docker-compose.template.yml");
	console.log("");
	console.log("Example:");
	console.log("node ecosystem.js up -m -c");
	console.log("");
	console.log("");
}

let args = process.argv.slice(2);
let action = args[0]; // up or down
args = args.slice(1); // get the rest of the arguments aside from action argument
let useOpenIdUrl = false;
let daemonMode = false;
let forceUpdateConfigs = false;
let useComposeTemplate = false;
let walletClientUrl = "http://wallet-mock:7777";

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

	if (arg === '--react-frontend') {
		walletClientUrl = "http://localhost:3000/cb";
		console.log(`Changed client url to ${walletClientUrl}`);
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

    if (!fs.existsSync(npmrcFile) || forceUpdateConfigs === 'false') {
      fs.writeFileSync(npmrcFile, '', { mode: 0o600 });
      fs.writeFileSync(npmrcFile, replaceTokenInTemplate(npmrcTemplateFile, githubToken));
    }
  }
} else {
  console.error(`Error: No such file: ${githubTokenFile}`);
  console.error(`Write GitHub token to '${githubTokenFile}' before running this script.`);
  process.exit(1);
}

const walletCoreUrl = "http://enterprise-verifier-core:9000";

// Redis cache configuration
const redisUrl = 'redis://wallet-cache';

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

if (action === "down") {
	console.log("Performing 'docker compose down'");
	// Implement the logic to stop Docker services here
	execSync('docker compose down', { stdio: 'inherit' });
	process.exit();
}

if (action !== "up") {
	console.log("Error: First argument must be 'up' or 'down'");
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
		configContent = configContent.replace(/REDIS_URL/g, redisUrl);
		configContent = configContent.replace(/WALLET_CLIENT_URL/g, walletClientUrl);
	
		fs.writeFileSync(configPath, configContent);
	}


}


{ // wallet enterprise vid issuer configuration
	const configPath = 'wallet-enterprise-vid-issuer/config/config.development.ts';
	const templatePath = 'wallet-enterprise-vid-issuer/config/config.template.ts';

	if (fs.existsSync(configPath) && forceUpdateConfigs === false) {
		console.log("wallet-enterprise-vid-issuer/config/config.development.ts was not changed");
	}
	else {
		fs.copyFileSync(templatePath, configPath);

		const servicePort = 8003;
		const serviceUrl = `http://wallet-enterprise-vid-issuer:${servicePort}`;
		const dbName = 'vidissuer';
	
		let configContent = fs.readFileSync(configPath, 'utf-8');
		configContent = configContent.replace(/SERVICE_URL/g, serviceUrl);
		configContent = configContent.replace(/SERVICE_SECRET/g, secret);
		configContent = configContent.replace(/SERVICE_PORT/g, servicePort);
		configContent = configContent.replace(/DB_HOST/g, dbHost);
		configContent = configContent.replace(/DB_PORT/g, dbPort);
		configContent = configContent.replace(/DB_USER/g, dbUser);
		configContent = configContent.replace(/DB_PASSWORD/g, dbPassword);
		configContent = configContent.replace(/DB_NAME/g, dbName);
		configContent = configContent.replace(/REDIS_URL/g, redisUrl);
		configContent = configContent.replace(/WALLET_CLIENT_URL/g, walletClientUrl);
		configContent = configContent.replace(/WALLET_CORE_URL/g, walletCoreUrl);
	
		fs.writeFileSync(configPath, configContent);
	}
}


{ // wallet enterprise diploma issuer configuration
	const configPath = 'wallet-enterprise-diploma-issuer/config/config.development.ts';
	const templatePath = 'wallet-enterprise-diploma-issuer/config/config.template.ts';

	if (fs.existsSync(configPath) && forceUpdateConfigs === false) {
		console.log("wallet-enterprise-diploma-issuer/config/config.development.ts was not changed");
	}
	else {
		fs.copyFileSync(templatePath, configPath);

		const servicePort = 8000;
		const serviceUrl = `http://wallet-enterprise-diploma-issuer:${servicePort}`;
		const dbName = 'issuer';
	
		let configContent = fs.readFileSync(configPath, 'utf-8');
		configContent = configContent.replace(/SERVICE_URL/g, serviceUrl);
		configContent = configContent.replace(/SERVICE_SECRET/g, secret);
		configContent = configContent.replace(/SERVICE_PORT/g, servicePort);
		configContent = configContent.replace(/DB_HOST/g, dbHost);
		configContent = configContent.replace(/DB_PORT/g, dbPort);
		configContent = configContent.replace(/DB_USER/g, dbUser);
		configContent = configContent.replace(/DB_PASSWORD/g, dbPassword);
		configContent = configContent.replace(/DB_NAME/g, dbName);
		configContent = configContent.replace(/REDIS_URL/g, redisUrl);
		configContent = configContent.replace(/WALLET_CLIENT_URL/g, walletClientUrl);
		configContent = configContent.replace(/WALLET_CORE_URL/g, walletCoreUrl);
	
		fs.writeFileSync(configPath, configContent);
	}

};


{ // verifier core configuration
	const configPath = 'enterprise-verifier-core/config/config.development.ts';
	const templatePath = 'enterprise-verifier-core/config/config.template.ts';

	if (fs.existsSync(configPath) && forceUpdateConfigs === false) {
		console.log("enterprise-verifier-core/config/config.development.ts was not changed");
	}
	else {
		fs.copyFileSync(templatePath, configPath);

		const servicePort = 9000;
		const serviceUrl = `http://enterprise-verifier-core:${servicePort}`;
		const dbName = 'core';
	
		let configContent = fs.readFileSync(configPath, 'utf-8');
		configContent = configContent.replace(/SERVICE_URL/g, serviceUrl);
		configContent = configContent.replace(/SERVICE_SECRET/g, secret);
		configContent = configContent.replace(/SERVICE_PORT/g, servicePort);
		configContent = configContent.replace(/DB_HOST/g, dbHost);
		configContent = configContent.replace(/DB_PORT/g, dbPort);
		configContent = configContent.replace(/DB_USER/g, dbUser);
		configContent = configContent.replace(/DB_PASSWORD/g, dbPassword);
		configContent = configContent.replace(/DB_NAME/g, dbName);
		configContent = configContent.replace(/REDIS_URL/g, redisUrl);
		configContent = configContent.replace(/WALLET_CLIENT_URL/g, walletClientUrl);
		configContent = configContent.replace(/WALLET_CORE_URL/g, walletCoreUrl);
	
		fs.writeFileSync(configPath, configContent);
	}


};


// Copy DID keys for VID issuer
const vidIssuerKeysSrc = path.resolve(__dirname, './keys/vid-issuer.keys');
const vidIssuerKeysDest = path.resolve(__dirname, 'wallet-enterprise-vid-issuer/keys');
copyKeys(vidIssuerKeysSrc, vidIssuerKeysDest);

// Copy DID keys for Diploma issuer
const issuerKeysSrc = path.resolve(__dirname, './keys/issuer-did.uoa.keys');
const issuerKeysDest = path.resolve(__dirname, 'wallet-enterprise-diploma-issuer/keys');
copyKeys(issuerKeysSrc, issuerKeysDest);


if (daemonMode === false) {
	console.log("Performing 'docker compose up'");
	execSync('docker compose up', { stdio: 'inherit' });
} else {
	console.log("Performing 'docker compose up -d'");
	execSync('docker compose up -d', { stdio: 'inherit' });
}
