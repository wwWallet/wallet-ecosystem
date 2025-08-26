FROM node:22-bullseye-slim AS builder

WORKDIR /dependencies

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY wallet-enterprise/ .

RUN rm -rf /app/src/configuration/
COPY ./wallet-enterprise-configurations/acme-verifier/src/configuration/ /app/src/configuration/
COPY ./wallet-enterprise-configurations/acme-verifier/public/styles/main.css /app/public/styles/main.css
COPY ./wallet-enterprise-configurations/acme-verifier/public/images /app/public/images

RUN yarn cache clean && yarn install && yarn build && rm -rf node_modules/ && yarn install --production

# Production stage
FROM node:22-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views/ ./views/


ENV NODE_ENV=production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]