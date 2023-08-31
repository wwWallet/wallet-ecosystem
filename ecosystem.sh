#!/bin/bash

base_url="http://127.0.0.1"

help() {
	echo "Usage: ./ecosystem <up or down> <OPTIONS>"
	echo "OPTIONS:"
	echo "   -m                Redirection will be directed to the openid:// URL. Note: It will be applied only in the first execution of the script and every time '-c' is given"
	echo "   -d                Start the ecosystem in deamonized mode"
	echo "   -c                Force update of the configurations to the defaults for the development environment"
	echo "   -b <url>          Set the base URL"
	echo "   -t                Force the usage of the docker-compose.template.yml"
	echo "   --react-frontend  Use wallet client at http://localhost:3000/cb instead of ${base_url}:7777"
	echo ""
	echo "Example:"
	echo "./ecosystem up -m -c"
	echo ""
	echo ""
}

action=$1		# up or down
use_openid_url="false"
daemon_mode="false"
force_update_configs="false"
use_compose_template="false"

for arg in "$@"; do
	if [[ $arg == '-t' ]]; then
		use_compose_template="true"
		echo "Refreshed docker-compose.yml using the template docker-compose.template.yml"
	fi

	if [[ $arg == '-m' ]]; then
		use_openid_url="true"
		echo "Wallet URL is now openid:// in all configurations"
	fi

	if [[ $arg == '-d' ]]; then
		daemon_mode="true"
	fi

	if [[ $arg == '-c' ]]; then
		force_update_configs="true"
		echo "Forcing update in configs"
	fi

	if [[ $prev_arg == '-b' ]]; then
		base_url=$arg
		echo "Changed the base url to $base_url"
	fi

	if [[ $arg == '--react-frontend' ]]; then
		wallet_client_url="http://localhost:3000/cb"
		echo "Changed the wallet client URL to $wallet_client_url"
	fi

	if [[ $arg == '--help' ]]; then
		help
		exit
	fi
	prev_arg=$arg
done

wallet_client_url="${wallet_client_url:-${base_url}:7777}"

if [ ! -f "$PWD/docker-compose.yml" ] || [ "$use_compose_template" = "true" ]
then
	cp docker-compose.template.yml docker-compose.yml
fi

if [ "$use_openid_url" = "true" ]
then
	wallet_client_url="openid://cb"
fi

if [ "$action" = "down" ]
then
	docker compose down
	exit
fi

if [ "$action" = "init" ]
then
	docker-compose run --rm -t --workdir /home/node/app/cli wallet-backend-server sh -c '
		set -e # Exit on error
		yarn install
		export DB_HOST="127.0.0.1"
		export DB_PORT="3307"
		export DB_USER="root"
		export DB_PASSWORD="root"
		export DB_NAME="wallet"
		./configwallet.js create issuer \
			--friendlyName "National VID Issuer" \
			--url http://127.0.0.1:8003 \
			--did did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt \
			--client_id did:ebsi:zyhE5cJ7VVqYT4gZmoKadFt
		./configwallet.js create issuer \
			--friendlyName "University of Athens" \
			--url http://127.0.0.1:8000 \
			--did did:ebsi:zpq1XFkNWgsGB6MuvJp21vA \
			--client_id did:ebsi:zpq1XFkNWgsGB6MuvJp21vA
	'

	docker-compose run --rm -t --workdir /home/node/app/cli enterprise-verifier-core sh -c '
		yarn install
		export SERVICE_URL=http://127.0.0.1:9000
		export ENTERPRISE_CORE_USER=""
		export ENTERPRISE_CORE_SECRET=""
		./configver.js clear  # clear old configuration
		./configver.js        # send the new configuration
	'

	exit
fi

if [ "$action" != "up" ]
then
	echo "Error: First argument must be 'up' or 'down'"
	help
	exit
fi


secret=dsfkwfkwfwdfdsfSaSe2e34r4frwr42rAFdsf2lfmfsmklfwmer


# Set up GitHub token in .npmrc files
github_token_file=".github-token"
github_token=$(cat ${github_token_file})
chmod 600 "${github_token_file}"
if [[ -f "${github_token_file}" ]]; then
	github_token=$(cat ${github_token_file})
	for npmrc_template_file in $(find . -name '.npmrc.template'); do
		npmrc_file="${npmrc_template_file%.template}"
		if ! [[ -f "${npmrc_file}" ]] || [ "$force_update_configs" = "false" ]; then
			touch "${npmrc_file}"
			chmod 600 "${npmrc_file}"
			sed "s/\${GITHUB_AUTH_TOKEN}/${github_token}/" "${npmrc_template_file}" > "${npmrc_file}"
		fi
	done
else
	echo "Error: No such file: ${github_token_file} . Write GitHub token to this file before running this script."
	exit 1
fi


# Enterprise wallet core configuration
if [ -f "$PWD/wallet-enterprise-diploma-issuer/config/config.development.ts" ] && [ "$force_update_configs" = "false" ]
then
	echo "enterprise-verifier-core/config/config.development.ts was not changed"
else
	cp enterprise-verifier-core/config/config.template.ts enterprise-verifier-core/config/config.development.ts
	wallet_core_port="9000"
	wallet_core_url="$base_url:$wallet_core_port"

	sed -i "s#SERVICE_URL#$wallet_core_url#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#SERVICE_SECRET#$secret#g" enterprise-verifier-core/config/config.development.ts

	sed -i "s#SERVICE_PORT#$wallet_core_port#g" enterprise-verifier-core/config/config.development.ts

	sed -i "s#DB_HOST#127.0.0.1#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#DB_PORT#3307#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#DB_USER#root#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#DB_PASSWORD#root#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#DB_NAME#core#g" enterprise-verifier-core/config/config.development.ts

	sed -i "s#REDIS_URL#redis://127.0.0.1#g" enterprise-verifier-core/config/config.development.ts
	sed -i "s#WALLET_CLIENT_URL#$wallet_client_url#g" enterprise-verifier-core/config/config.development.ts
fi


# Enterprise issuer configuration
if [ -e "$PWD/wallet-enterprise-diploma-issuer/config/config.development.ts" ] && [ "$force_update_configs" = "false" ]
then
	echo "wallet-enterprise-diploma-issuer/config/config.development.ts was not changed"
else
	cp wallet-enterprise-diploma-issuer/config/config.template.ts wallet-enterprise-diploma-issuer/config/config.development.ts

	service_port="8000"
	service_url="$base_url:$service_port"
	sed -i "s#SERVICE_URL#$service_url#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#SERVICE_SECRET#$secret#g" wallet-enterprise-diploma-issuer/config/config.development.ts

	sed -i "s#SERVICE_PORT#$service_port#g" wallet-enterprise-diploma-issuer/config/config.development.ts

	sed -i "s#DB_HOST#127.0.0.1#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#DB_PORT#3307#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#DB_USER#root#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#DB_PASSWORD#root#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#DB_NAME#issuer#g" wallet-enterprise-diploma-issuer/config/config.development.ts

	sed -i "s#REDIS_URL#redis://127.0.0.1#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#WALLET_CLIENT_URL#$wallet_client_url#g" wallet-enterprise-diploma-issuer/config/config.development.ts
	sed -i "s#WALLET_CORE_URL#$wallet_core_url#g" wallet-enterprise-diploma-issuer/config/config.development.ts
fi

# Enterprise VID Issuer configuration
if [ -e "$PWD/wallet-enterprise-vid-issuer/config/config.development.ts" ] && [ "$force_update_configs" = "false" ]
then
	echo "wallet-enterprise-vid-issuer/config/config.development.ts was not changed"
else
	cp wallet-enterprise-vid-issuer/config/config.template.ts wallet-enterprise-vid-issuer/config/config.development.ts

	service_port="8003"
	service_url="$base_url:$service_port"
	sed -i "s#SERVICE_URL#$service_url#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#SERVICE_SECRET#$secret#g" wallet-enterprise-vid-issuer/config/config.development.ts

	sed -i "s#SERVICE_PORT#$service_port#g" wallet-enterprise-vid-issuer/config/config.development.ts

	sed -i "s#DB_HOST#127.0.0.1#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#DB_PORT#3307#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#DB_USER#root#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#DB_PASSWORD#root#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#DB_NAME#vidissuer#g" wallet-enterprise-vid-issuer/config/config.development.ts

	sed -i "s#REDIS_URL#redis://127.0.0.1#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#WALLET_CLIENT_URL#$wallet_client_url#g" wallet-enterprise-vid-issuer/config/config.development.ts
	sed -i "s#WALLET_CORE_URL#$wallet_core_url#g" wallet-enterprise-vid-issuer/config/config.development.ts
fi



# Wallet backend configuration
if [ -e "$PWD/wallet-backend-server/config/config.development.ts" ] && [ "$force_update_configs" = "false" ]
then
	echo "wallet-backend-server/config/config.development.ts was not changed"
else
	cp wallet-backend-server/config/config.template.ts wallet-backend-server/config/config.development.ts

	service_port="8002"
	service_url="$base_url:$service_port"
	sed -i "s#SERVICE_URL#$service_url#g" wallet-backend-server/config/config.development.ts
	sed -i "s#SERVICE_SECRET#$secret#g" wallet-backend-server/config/config.development.ts

	sed -i "s#SERVICE_PORT#$service_port#g" wallet-backend-server/config/config.development.ts

	sed -i "s#DB_HOST#127.0.0.1#g" wallet-backend-server/config/config.development.ts
	sed -i "s#DB_PORT#3307#g" wallet-backend-server/config/config.development.ts
	sed -i "s#DB_USER#root#g" wallet-backend-server/config/config.development.ts
	sed -i "s#DB_PASSWORD#root#g" wallet-backend-server/config/config.development.ts
	sed -i "s#DB_NAME#wallet#g" wallet-backend-server/config/config.development.ts

	sed -i "s#REDIS_URL#redis://127.0.0.1#g" wallet-backend-server/config/config.development.ts
	sed -i "s#WALLET_CLIENT_URL#$wallet_client_url#g" wallet-backend-server/config/config.development.ts

fi



# Copy DID keys
if [ ! -e "$PWD/wallet-enterprise-diploma-issuer/keys/issuer-did.uoa.keys" ]
then
	mkdir -p $PWD/wallet-enterprise-diploma-issuer/keys
	cp ./keys/issuer-did.uoa.keys $PWD/wallet-enterprise-diploma-issuer/keys/issuer-did.uoa.keys
fi

if [ ! -e "$PWD/wallet-enterprise-vid-issuer/keys/vid-issuer.vid.keys" ]
then
	mkdir -p $PWD/wallet-enterprise-vid-issuer/keys
	cp ./keys/vid-issuer.keys $PWD/wallet-enterprise-vid-issuer/keys/vid-issuer.vid.keys
fi


if [ "$daemon_mode" = "false" ]
then
	docker compose up
else
	docker compose up -d
fi
