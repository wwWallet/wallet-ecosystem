<h1 align="center">
  <br>
  <a href="https://demo.wwwallet.org/"><img src="https://demo.wwwallet.org/static/media/logo.4c2efe036042f9f1f0a8.png" alt="wwWallet" width="150"></a>
  <br><center>Wallet Ecosystem</center>
  <br>
</h1>
<br>


## Quickstart

Prerequisites:

- Docker & Docker Compose

## Clone

```sh
git clone git@github.com:wwwallet/wallet-ecosystem.git
cd wallet-ecosystem/
git submodule update --init --remote --recursive
```

## Setup

1. Follow the instructions of [wallet-frontend](https://github.com/wwWallet/wallet-frontend/) and [wallet-backend-server](https://github.com/wwWallet/wallet-backend-server) to setup the environment.

2. Configure `/etc/hosts`

   Add the following lines in the /etc/hosts file:

   ```sh
   127.0.0.1 wallet-frontend
   127.0.0.1 wallet-backend-server
   127.0.0.1 wallet-enterprise-issuer
   127.0.0.1 wallet-enterprise-acme-verifier
   ```

3. Start the ecosystem

   ```sh
   node ecosystem.js up -t
   ```

   The argument `-t` forces the usage of the `docker-compose.template.yml`

4. Database Setup & Migrations

	The backend uses TypeORM migrations with `synchronize: false`.
	A baseline (Init) migration is included to create the full database schema for fresh environments.

	Run all migrations using the helper script inside the repository:
	```sh
	./wallet-backend-server/migrate.sh
	```
	This script runs the equivalent of: `docker exec -it wallet-backend-server yarn typeorm migration:run`

5. Entities' Initilization 
	For demonstrative purposes, we set up a small ecosystem with:

	- 1 Wallet Provider
	- 1 Credential Issuer
	- 1 Verifier

	The configuration of the issuing legal entities takes place with the following:

	```sh
	node ecosystem.js init
	```

For more options, see:

```sh
node ecosystem.js up --help
```

To shut down the ecosystem run the following command:

```sh
node ecosystem.js down
```

## Supported Flows

### Wallet-initiated Issuance Flow (Authorization Code Grant)

- Start the issuing from the wallet: http://localhost:3000/add
- Redirect to the issuing platform and select a method of authentication
- Fetch, review and select a credential
- Return to the wallet with the received credential

### Verifier-initiated Presentation Flow

- Start from the verifier's platform: http://wallet-enterprise-acme-verifier:8005/
- Select a VC or a combination of VCs to present
- Scan the QR to present your VC(s)

## Documentation

Visit https://wwwallet.github.io/wallet-docs/

## Contribution Guidelines

Want to contribute? Check out our [Contribution Guidelines](https://github.com/wwWallet/.github/blob/main/CONTRIBUTING.md) for more details!
