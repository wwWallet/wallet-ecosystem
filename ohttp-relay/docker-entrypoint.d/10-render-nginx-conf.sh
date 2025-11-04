#!/bin/sh
set -eu

: "${CORS_ALLOWED_ORIGINS:=*}"
: "${GATEWAY_URL:=http://localhost:4567}"
: "${GATEWAY_TYPE:=local}"

case "$GATEWAY_TYPE" in
  external)
    TEMPLATE_FILE="/etc/nginx/conf.d/default.conf.tpl.external"
    ;;
  local)
    TEMPLATE_FILE="/etc/nginx/conf.d/default.conf.tpl.local"
    ;;
  *)
    echo "Invalid GATEWAY_TYPE: '$GATEWAY_TYPE'. Must be 'local' or 'external'."
    exit 1
    ;;
esac

echo "Rendering Nginx config using template: $TEMPLATE_FILE"

envsubst '${CORS_ALLOWED_ORIGINS} ${GATEWAY_URL}' \
  < "$TEMPLATE_FILE" \
  > /etc/nginx/conf.d/default.conf

rm -f /etc/nginx/conf.d/default.conf.tpl.local /etc/nginx/conf.d/default.conf.tpl.external

# Validate config early; container will exit if invalid
nginx -t
