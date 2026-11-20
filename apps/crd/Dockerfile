# Build from the REPO ROOT:
#   docker build -f apps/crd/Dockerfile -t commutr-crd-web .
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:crd

FROM nginx:1.27-alpine
COPY apps/crd/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/crd/dist /usr/share/nginx/html/crd
