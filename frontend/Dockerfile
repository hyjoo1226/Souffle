FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
COPY .env.production .env.production
RUN yarn build --mode production
