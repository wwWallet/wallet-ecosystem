FROM nginx:1.27-alpine

# envsubst lives in gettext
RUN apk add --no-cache gettext

# Base nginx.conf that includes conf.d
COPY nginx.conf /etc/nginx/nginx.conf

# Our server config template (rendered at runtime)
COPY default.conf.tpl /etc/nginx/conf.d/default.conf.tpl

# Render template at container start (runs before nginx launches)
COPY docker-entrypoint.d/10-render-nginx-conf.sh /docker-entrypoint.d/10-render-nginx-conf.sh
RUN chmod +x /docker-entrypoint.d/10-render-nginx-conf.sh