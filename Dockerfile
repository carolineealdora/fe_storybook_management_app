# Build the SPA, then serve it with nginx (deploy/nginx). Run with -e BACKEND_ORIGIN=http://<backend>:9999
FROM node:24.18.0-alpine3.24 AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Leave empty to call /api on the same origin (recommended); set to call the API on another origin.
ARG VITE_API_URL
RUN pnpm build

FROM nginx:stable-alpine
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
ENV BACKEND_ORIGIN=http://backend:9999
EXPOSE 8080
