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
let buildImageTagContext = "";
let buildImageNames = [];
let buildImagesTag = "latest";
let buildImagesPushFlag = false;

function help() {
	if (action === 'up') {
		console.log("Usage: node ecosystem.js up <OPTIONS>");
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

	if (action === 'build-images') {
		console.log("Usage: node ecosystem.js build-images <OPTIONS>");
		console.log("OPTIONS:");
		console.log("   --context                Docker image tag context (ex. 'ghcr.io/wwwallet') [OPTIONAL]");
		console.log("   --names                  Names of images to be built in comma-separated format (ex. 'wallet-frontend,issuer,verifier') [OPTIONAL]");
		console.log("   --tag                    Docker image tag to be used (ex. 'latest') [OPTIONAL]");
		console.log("");
		console.log("Example:");
		console.log("node ecosystem.js build-images --tag latest --context ghcr.io/wwwallet --names wallet-frontend,issuer,verifier");
		console.log("");
		console.log("");
	}
}

for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	const next = args[i + 1];

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

	if (action === 'build-images' && arg === '--context' && next) {
		buildImageTagContext = next + '/';
	}

	if (action === 'build-images' && arg === '--names' && next) {
		buildImageNames = next.split(',');
	}

		if (action === 'build-images' && arg === '--push') {
		buildImagesPushFlag = true;
	}

	if (action === 'build-images' && arg === '--tag' && next) {
		buildImagesTag = next;
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
	execSync(`${dockerComposeCommand} exec -t wallet-backend-server sh -c "yarn typeorm migration:run"`, { stdio: 'inherit' });
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

	if (buildImageNames.length == 0 || buildImageNames.includes('wallet-frontend')) {
		execSync(`cd wallet-frontend && docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}wallet-frontend:${buildImagesTag} .`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('wallet-backend-server')) {
		execSync(`cd wallet-backend-server && docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}wallet-backend-server:${buildImagesTag} .`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('wallet-enterprise')) {
		execSync(`docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}wallet-enterprise:${buildImagesTag} wallet-enterprise`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('issuer')) {
		execSync(`docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}wallet-enterprise-issuer:${buildImagesTag} -f docker/wallet-enterprise-issuer.Dockerfile .`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('verifier')) {
		execSync(`docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}wallet-enterprise-verifier:${buildImagesTag} -f docker/wallet-enterprise-verifier.Dockerfile .`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('gateway')) {
		execSync(`docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}privacy-gateway-server-go:${buildImagesTag} -f privacy-gateway-server-go/Dockerfile ./privacy-gateway-server-go`, { stdio: 'inherit' });
	}

	if (buildImageNames.length == 0 || buildImageNames.includes('relay')) {
		execSync(`docker buildx build --platform linux/amd64 ${buildImagesPushFlag ? "--push" : "--load"} -t ${buildImageTagContext}ohttp-relay:${buildImagesTag} -f ohttp-relay/Dockerfile ./ohttp-relay`, { stdio: 'inherit' });
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

		fs.writeFileSync(configPath, configContent);
	}
}

{
	const keyPath = 'wallet-backend-server/keys/wallet-provider.key';
	const certPath = 'wallet-backend-server/keys/wallet-provider.pem';
	const caPath = 'wallet-backend-server/keys/ca.pem';

	if (fs.existsSync(keyPath) && fs.existsSync(certPath) && fs.existsSync(caPath) && forceUpdateConfigs === false) {
		console.log("wallet-backend-server wallet-provider keys were not overwritten");
	}
	else {
		const dir = 'wallet-backend-server/keys';
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}		
		const key = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgtfEWwPl5+13fqLPw
j/22afeqn/BgARhgjbtoRKcUFLyhRANCAARVYrxredzOKhD9OkE9tAUpRojCHcyy
7xvm/X6v3xyjPjRk/mt7J14j8FO1+46zhVscMo2Xnmp+NPr8ehstOlX6
-----END PRIVATE KEY-----
`;

		const cert = `-----BEGIN CERTIFICATE-----
MIICyzCCAnGgAwIBAgIULnrxux9sI34oqbby3M4lSKOs8owwCgYIKoZIzj0EAwIw
PzELMAkGA1UEBhMCRVUxFTATBgNVBAoMDHd3V2FsbGV0Lm9yZzEZMBcGA1UEAwwQ
d3dXYWxsZXQgUm9vdCBDQTAeFw0yNTA0MjkxMDI5NTNaFw0yNjA0MjkxMDI5NTNa
MEExCzAJBgNVBAYTAkVVMRUwEwYDVQQKDAx3d1dhbGxldC5vcmcxGzAZBgNVBAMM
EmxvY2FsLnd3d2FsbGV0Lm9yZzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABFVi
vGt53M4qEP06QT20BSlGiMIdzLLvG+b9fq/fHKM+NGT+a3snXiPwU7X7jrOFWxwy
jZeean40+vx6Gy06VfqjggFHMIIBQzAdBgNVHQ4EFgQUM/A3FTQLjww5/9u01MX/
SRyVqaUwHwYDVR0jBBgwFoAU0HGu3T+/Wqh3yNifz9sNd+HPBS4wDgYDVR0PAQH/
BAQDAgeAMDIGA1UdEgQrMCmBEWluZm9Ad3d3YWxsZXQub3JnhhRodHRwczovL3d3
d2FsbGV0Lm9yZzASBgNVHSUECzAJBgcogYxdBQECMAwGA1UdEwEB/wQCMAAwRAYD
VR0fBD0wOzA5oDegNYYzaHR0cHM6Ly93d3dhbGxldC5vcmcvaWFjYS9jcmwvd3d3
YWxsZXRfb3JnX2lhY2EuY3JsMFUGA1UdEQROMEyCEmxvY2FsLnd3d2FsbGV0Lm9y
Z4IZbG9jYWwtaXNzdWVyLnd3d2FsbGV0Lm9yZ4IbbG9jYWwtdmVyaWZpZXIud3d3
YWxsZXQub3JnMAoGCCqGSM49BAMCA0gAMEUCIQCQ8h+5krhO+f4woReDY1D7CaM6
qCda3m814e6DLvOphAIgHQL+Wm7WFRwxgjzMLN37RojJGrZbF4OFChIkmm0uu5o=
-----END CERTIFICATE-----
`;

		const ca = `-----BEGIN CERTIFICATE-----
MIICQDCCAeegAwIBAgIUa5v+g+yHrVdDFEfRy8GyoGtcT4YwCgYIKoZIzj0EAwIw
PzELMAkGA1UEBhMCRVUxFTATBgNVBAoMDHd3V2FsbGV0Lm9yZzEZMBcGA1UEAwwQ
d3dXYWxsZXQgUm9vdCBDQTAeFw0yNTA0MjIxMDM5NDZaFw00MDA0MTgxMDM5NDZa
MD8xCzAJBgNVBAYTAkVVMRUwEwYDVQQKDAx3d1dhbGxldC5vcmcxGTAXBgNVBAMM
EHd3V2FsbGV0IFJvb3QgQ0EwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASkZIoc
6df1R0mEWz3qHQxgRjKDtVTZvDzhPCEqVTePw4zSzy8T0VCdOH77ItRP1w3Rwjeg
vHrY1CzmMNtQDWoMo4HAMIG9MB0GA1UdDgQWBBTQca7dP79aqHfI2J/P2w134c8F
LjAOBgNVHQ8BAf8EBAMCAQYwMgYDVR0SBCswKYERaW5mb0B3d3dhbGxldC5vcmeG
FGh0dHBzOi8vd3d3YWxsZXQub3JnMBIGA1UdEwEB/wQIMAYBAf8CAQAwRAYDVR0f
BD0wOzA5oDegNYYzaHR0cHM6Ly93d3dhbGxldC5vcmcvaWFjYS9jcmwvd3d3YWxs
ZXRfb3JnX2lhY2EuY3JsMAoGCCqGSM49BAMCA0cAMEQCIF+qqe7urRAop2jQJ6B9
fYvvp4c4HYxsWLNa9aYpCWxxAiAGgtVdZWW19dDU1G0AGy8FTWlcKiczWyVIQtvA
L3rT4w==
-----END CERTIFICATE-----
`;
		fs.writeFileSync(keyPath, key, { encoding: 'utf-8' });
		fs.writeFileSync(certPath, cert, { encoding: 'utf-8' });
		fs.writeFileSync(caPath, ca, { encoding: 'utf-8' });
	}
}

if (daemonMode === false) {
	console.log("Performing 'docker compose up'");
	execSync(`${dockerComposeCommand} up --build`, { stdio: 'inherit' });
} else {
	console.log("Performing 'docker compose up -d'");
	execSync(`${dockerComposeCommand} up --build -d`, { stdio: 'inherit' });
}
