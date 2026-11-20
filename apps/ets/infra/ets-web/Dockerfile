# Phase 3 build: served under /ets/
#   docker build --build-arg VITE_APP_BASE=/ets/ -t commutr-ets-web .
# Env vars (VITE_*) must be passed as build args / .env at build time.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_APP_BASE=/ets/
ENV VITE_APP_BASE=$VITE_APP_BASE
RUN npm run build

FROM nginx:1.27-alpine
COPY infra/ets-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/ets
