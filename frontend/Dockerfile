FROM node:20-alpine AS builder

ARG VITE_APP_API_URL
ENV VITE_APP_API_URL=$VITE_APP_API_URL

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

