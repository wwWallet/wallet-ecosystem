# Builder stage
FROM ghcr.io/wwwallet/wallet-enterprise:base AS builder
WORKDIR /app

COPY wallet-enterprise/ .
RUN rm -rf src/configuration/
COPY ./wallet-enterprise-configurations/vid-issuer/src/configuration/ src/configuration/
COPY ./wallet-enterprise-configurations/vid-issuer/public/styles/styles.css public/styles/styles.css
COPY ./wallet-enterprise-configurations/vid-issuer/public/images/ public/images/
COPY ./wallet-enterprise-configurations/vid-issuer/views/header.pug /app/views/header.pug
COPY ./wallet-enterprise-configurations/vid-issuer/views/index.pug /app/views/index.pug

RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install && yarn build

# Production stage
FROM node:16-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/views/ ./views/

RUN --mount=type=secret,id=npmrc,required=true,target=./.npmrc,uid=1000 \
    yarn cache clean && yarn install --production

ENV NODE_ENV production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]