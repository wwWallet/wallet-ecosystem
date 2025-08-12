FROM node:22-bullseye-slim AS dependencies

WORKDIR /dependencies

RUN apt-get update && apt-get install -y git

# Install dependencies first so rebuild of these layers is only needed when dependencies change
COPY lib/ ./lib/

WORKDIR /dependencies/lib/wallet-common
RUN yarn install && yarn cache clean -f && yarn build

WORKDIR /dependencies
COPY ./wallet-frontend/package.json ./wallet-frontend/yarn.lock .
RUN yarn add /dependencies/lib/wallet-common && yarn install && yarn cache clean -f

FROM node:22-bullseye-slim AS development

COPY --from=dependencies /dependencies/node_modules /app/node_modules

WORKDIR /app
ENV NODE_ENV=development
CMD [ "yarn", "start-docker" ]

# src/ and public/ will be mounted from host, but we need some config files in the image for startup
COPY ./wallet-frontend/ .

# Set user last so everything is readonly by default
USER node
