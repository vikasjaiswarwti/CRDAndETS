# Launcher (login + app chooser), served at "/".
# Build from the REPO ROOT:
#   docker build -f apps/auth/infra/launcher/Dockerfile -t commutr-launcher .
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:auth

FROM nginx:1.27-alpine
COPY apps/auth/infra/launcher/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/auth/dist /usr/share/nginx/html
