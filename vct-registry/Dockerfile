FROM node:22-alpine

# 1) Create app directory
WORKDIR /usr/src/app

# 2) Install deps (this layer can be cached)
COPY package*.json ./
RUN yarn install

# 3) Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 8002 

# 4) Default command (prod)
CMD ["npm", "start"]