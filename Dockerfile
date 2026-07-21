# Build the PWA, then serve the static bundle with Caddy.
# TLS is terminated at your edge (Cloudflare tunnel / reverse proxy), so the
# container serves plain HTTP on :80.

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
