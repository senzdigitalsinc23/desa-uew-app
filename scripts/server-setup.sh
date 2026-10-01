#!/bin/bash
# ── DESA UEW — Server Setup Script ───────────────────────────────
#
# Run this ONCE on your staging server to prepare it for CI/CD:
#
#   curl -sSL https://raw.githubusercontent.com/senzdigitalsinc23/desa-uew-app/main/scripts/server-setup.sh | bash
#
# Or copy-paste each section manually.

set -e

APP_DIR="/opt/desa-uew"
REPO="senzdigitalsinc23/desa-uew-app"

echo "=================================================="
echo "  DESA UEW — Staging Server Setup"
echo "=================================================="

# ── 1. Install Docker & Docker Compose ─────────────────────────
echo ""
echo "[1/4] Installing Docker..."

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    newgrp docker
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "  Docker: $(docker --version)"
echo "  Compose: $(docker compose version | awk '{print $NF}')"

# ── 2. Create app directory ────────────────────────────────────
echo ""
echo "[2/4] Setting up app directory..."

sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

cd "$APP_DIR"

# Clone or pull repo
if [ ! -d ".git" ]; then
    echo "  Cloning repository..."
    git clone "https://github.com/$REPO.git" . || git init && git remote add origin "https://github.com/$REPO.git"
else
    echo "  Pulling latest code..."
    git pull origin main || git pull origin master || true
fi

# ── 3. Generate secrets ────────────────────────────────────────
echo ""
echo "[3/4] Generating secrets..."

if [ ! -f ".env" ]; then
    cp .env.staging .env
    echo "  Created .env from template"
fi

# Generate random secrets if missing
if grep -q 'change_me' .env 2>/dev/null; then
    echo "  ⚠  Found placeholder values in .env"
    echo "     Edit $APP_DIR/.env and set your real values"
    echo ""
    echo "     Required:"
    echo "       DB_ROOT_PASS, DB_USER, DB_PASS"
    echo "       JWT_SECRET (64+ chars)"
    echo "       API_KEY, API_SECRET"
    echo "       S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY"
    echo "       APP_URL (your domain)"
fi

# Generate JWT_SECRET if empty
if grep -q '^JWT_SECRET=$' .env 2>/dev/null; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
    echo "  ✓ Generated JWT_SECRET"
fi

# ── 4. Test deploy ─────────────────────────────────────────────
echo ""
echo "[4/4] Testing deployment..."

echo "  Building images (this may take a few minutes)..."
docker compose build --progress=plain app nginx 2>&1 | tail -5

echo ""
echo "  Starting services..."
docker compose up -d

echo ""
echo "  Checking health..."
sleep 15
docker compose ps

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo ""
echo "  App URL:    ${APP_URL:-http://YOUR_SERVER_IP}"
echo "  Logs:       docker compose logs -f"
echo "  Restart:    docker compose restart"
echo "  Rebuild:    docker compose build && docker compose up -d"
echo ""
echo "  Next step: Configure GitHub Secrets (see DEPLOY.md)"
echo "=================================================="
