FROM node:22-bullseye-slim AS dependencies

WORKDIR /dependencies

RUN apt-get update && apt-get install -y git

# Install dependencies first so rebuild of these layers is only needed when dependencies change
COPY lib/ ./lib/
COPY wallet-frontend/lib/jose/ ./lib/jose/

WORKDIR /dependencies/lib/wallet-common
RUN yarn install && yarn cache clean -f && yarn build

WORKDIR /dependencies
COPY ./wallet-frontend/package.json ./wallet-frontend/yarn.lock .
RUN  yarn install && yarn cache clean -f

FROM node:22-bullseye-slim AS development

COPY --from=dependencies /dependencies/node_modules /app/node_modules

WORKDIR /app
ENV NODE_ENV=development
CMD [ "yarn", "start-docker" ]

# src/ and public/ will be mounted from host, but we need some config files in the image for startup
COPY ./wallet-frontend/ .

# :hammer_and_wrench: Fix: Ensure Vite has permissions to write inside `/app`
RUN mkdir -p /app/node_modules/.vite && chown -R node /app/node_modules

# Set user last so everything else is readonly by default
USER node
