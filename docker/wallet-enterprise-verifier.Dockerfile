FROM node:22-bullseye-slim AS builder

WORKDIR /dependencies

RUN apt-get update && apt-get install -y git

# Install dependencies first so rebuild of these layers is only needed when dependencies change
COPY lib/ ./lib/

WORKDIR /dependencies/lib/wallet-common
RUN yarn install && yarn cache clean -f && yarn build && mkdir -p /app/lib && mv /dependencies/lib/wallet-common /app/lib/wallet-common

WORKDIR /app
COPY wallet-enterprise/ .

RUN rm -rf /app/src/configuration/
COPY ./wallet-enterprise-configurations/acme-verifier/src/configuration/ /app/src/configuration/
COPY ./wallet-enterprise-configurations/acme-verifier/public/styles/main.css /app/public/styles/main.css
COPY ./wallet-enterprise-configurations/acme-verifier/public/images /app/public/images

RUN yarn cache clean && yarn install && yarn build

# Production stage
FROM node:22-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/lib/wallet-common/ ./lib/wallet-common/
COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views/ ./views/


RUN yarn cache clean && yarn install --production


ENV NODE_ENV=production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]