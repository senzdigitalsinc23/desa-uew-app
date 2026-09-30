# DESA UEW — Docker Deployment Guide

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   nginx     │────▶│  PHP-FPM     │────▶│   MySQL     │
│  (React +   │     │  (API)       │     │  (db)       │
│   proxy)    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
     :80                   :9000                :3306
```

- **nginx** serves the React SPA at `/` and proxies `/api/*` to PHP-FPM
- **PHP-FPM** runs the Laravel-style API on port 9000
- **MySQL 8.0** persists the database in a named volume

---

## Quick Start

### 1. Clone & prepare

```bash
git clone <your-repo> /opt/desa-uew
cd /opt/desa-uew
cp .env.staging .env
nano .env   # fill in secrets below
```

### 2. Fill in `.env`

At minimum, set these values:

```bash
# Database
DB_ROOT_PASS=your_strong_root_password
DB_USER=desa_user
DB_PASS=your_strong_desa_password

# JWT & API auth (generate random strings)
JWT_SECRET=$(php -r "echo bin2hex(random_bytes(32));")
API_KEY=your_random_api_key
API_SECRET=your_random_api_secret

# S3 file storage
S3_BUCKET=desa-stores
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key
S3_URL=https://desa-stores.s3.us-east-1.amazonaws.com

# App URL (your staging domain)
APP_URL=https://staging.desauew.com
CORS_ALLOWED_ORIGINS=https://staging.desauew.com
```

### 3. Build & launch

```bash
docker compose up -d --build
```

This builds two images:
- `desa-api` — PHP 8.4 FPM with all Composer dependencies
- `desa-nginx` — Nginx serving the React build (built inside the container)

### 4. Verify

```bash
docker compose ps          # all should show "healthy"
docker compose logs -f api # watch for "Migrations completed"
```

Open `https://your-domain` in a browser.

---

## Services

| Service    | Image                    | Port  | Purpose                          |
|-----------|--------------------------|-------|----------------------------------|
| `nginx`   | built from DESA-UEW-UI   | 80    | React SPA + reverse proxy        |
| `app`     | built from DESA-UEW-API  | 9000  | PHP-FPM API backend              |
| `db`      | `mysql:8.0`              | 3306  | MySQL database (persistent)      |

---

## Common Commands

```bash
# View logs
docker compose logs -f
docker compose logs -f api
docker compose logs -f db

# Restart all services
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Stop and remove containers (volumes preserved)
docker compose down

# Stop and delete everything (⚠️ wipes database)
docker compose down -v

# Run migrations manually
docker compose exec app php cli.php migrate

# Run a one-off query
docker compose exec db mysql -u root -p${DB_ROOT_PASS} desa_db

# Shell into the API container
docker compose exec app sh

# Backup database
docker compose exec db mysqldump -u root -p${DB_ROOT_PASS} desa_db > backup-$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker compose exec -T db mysql -u root -p${DB_ROOT_PASS} desa_db
```

---

## HTTPS with caddy (optional)

Add this to your server alongside `docker-compose.yml`:

```yaml
# docker-compose.proxy.yml
services:
  caddy:
    image: caddy:latest
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
volumes:
  caddy_data:
  caddy_config:
```

```
# Caddyfile
staging.desauew.com {
    reverse_proxy desa-nginx:80
}
```

```bash
docker compose -f docker-compose.yml -f docker-compose.proxy.yml up -d
```

---

## Troubleshooting

### API returns 502 Bad Gateway
```bash
docker compose logs app | tail -50
# Check that PHP-FPM is running and not crashing on startup
```

### Database connection refused
```bash
docker compose logs db | tail -20
# Ensure MYSQL_ROOT_PASSWORD in .env matches what's in the init script
```

### Images not loading (403/404)
```bash
# Check CORS config
docker compose exec app php -r "echo getenv('CORS_ALLOWED_ORIGINS');"
# Verify S3 credentials are set
docker compose exec app php -r "echo getenv('S3_BUCKET');"
```

### React shows blank page
```bash
# Check nginx logs
docker compose logs nginx | tail -30
# Rebuild the UI image
docker compose build nginx
```

### Need to reset the database
```bash
docker compose down -v
docker compose up -d
# Migrations run automatically on first boot
```

---

## File Structure

```
/
├── docker-compose.yml          # Main orchestration
├── .env.staging                # Template (commit this)
├── .env                        # Secrets (never commit)
├── DEPLOY.md                   # This file
├── DESA-UEW-API/
│   ├── Dockerfile              # PHP 8.4 FPM production image
│   ├── .dockerignore
│   └── docker/php/
│       ├── entrypoint.sh       # Waits for DB, runs migrations
│       ├── php.ini             # Production PHP settings
│       └── opcache.ini         # OPcache tuned for production
├── DESA-UEW-UI/
│   ├── Dockerfile              # Multi-stage: Node → Nginx
│   └── .dockerignore
└── docker/
    ├── nginx/
    │   └── staging.conf        # Nginx: SPA + API proxy
    └── mysql/
        └── init.sql            # Creates DB user on first boot
```
