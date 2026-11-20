# Build from the REPO ROOT:
#   docker build -f apps/ets/infra/ets-web/Dockerfile --build-arg VITE_APP_BASE=/ets/ -t commutr-ets-web .
# VITE_* values are read from apps/ets/.env(.production) at build time (create it on the server).
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
ARG VITE_APP_BASE=/ets/
ENV VITE_APP_BASE=$VITE_APP_BASE
RUN npm run build:ets

FROM nginx:1.27-alpine
COPY apps/ets/infra/ets-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/ets/dist /usr/share/nginx/html/ets
