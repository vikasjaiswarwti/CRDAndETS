FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY templates/ /etc/nginx/templates/
# Substitute only our variables; leave nginx's own $vars intact
ENV NGINX_ENVSUBST_FILTER="^(AUTH_HOST|CORE_HOST|CRD_HOST)$"
