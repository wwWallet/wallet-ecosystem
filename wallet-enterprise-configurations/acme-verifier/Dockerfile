# Builder stage
FROM ghcr.io/gunet/wallet-enterprise:base AS builder
WORKDIR /app


RUN rm -rf /app/src/configuration/

COPY ./wallet-enterprise-configurations/acme-verifier/src/configuration src/configuration
COPY ./wallet-enterprise-configurations/acme-verifier/public/styles/styles.css public/styles/styles.css
COPY ./wallet-enterprise-configurations/acme-verifier/public/site.webmanifest public/site.webmanifest
COPY ./wallet-enterprise-configurations/acme-verifier/views/index.pug views/index.pug
COPY ./wallet-enterprise-configurations/acme-verifier/views/header.pug views/header.pug
COPY ./wallet-enterprise-configurations/acme-verifier/views/verifier/public_definitions.pug views/verifier/public_definitions.pug
COPY ./wallet-enterprise-configurations/acme-verifier/views/verifier/QR.pug views/verifier/QR.pug
COPY ./wallet-enterprise-configurations/acme-verifier/views/verifier/success.pug views/verifier/success.pug
COPY ./wallet-enterprise-configurations/acme-verifier/public/images public/images

RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install && yarn build

# Production stage
FROM node:20-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views/ ./views/


RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install --production


ENV NODE_ENV production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]