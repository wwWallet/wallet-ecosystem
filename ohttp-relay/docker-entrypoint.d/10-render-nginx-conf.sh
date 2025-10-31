#!/bin/sh
set -eu

# Default if not provided by the environment
: "${CORS_ALLOWED_ORIGINS:=*}"
: "${GATEWAY_URL:=http://localhost:4567}"

# Only substitute the vars we intend to change, leave $host etc. intact
envsubst '${CORS_ALLOWED_ORIGINS} ${GATEWAY_URL}' \
  < /etc/nginx/conf.d/default.conf.tpl \
  > /etc/nginx/conf.d/default.conf

rm -f /etc/nginx/conf.d/default.conf.tpl

# Validate config early; container will exit if invalid
nginx -t