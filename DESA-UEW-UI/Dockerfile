# ── Multi-stage: build React app ───────────────────────────────────
FROM node:20-alpine AS ui-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ── Nginx: serve React dist ────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default config (replaced by staging.conf volume mount)
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=ui-build /app/dist /usr/share/nginx/html

EXPOSE 80
