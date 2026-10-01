# ── DESA UEW CI/CD Setup Guide ──────────────────────────────────
#
# This project uses GitHub Actions for automated deployment.
#
# Pipeline overview:
#   push to main   →  Build images  →  Push to GHCR  →  Deploy to server
#   push to staging →  Fast deploy (pull existing images)
#   tag v*        →  Full rebuild + deploy (release)
#
# ─────────────────────────────────────────────────────────────────
#
# Step 1: Prepare Your Server
# ─────────────────────────────────────────────────────────────────
#
# Option A — One-liner (recommended):
#   curl -sSL https://raw.githubusercontent.com/senzdigitalsinc23/desa-uew-app/main/scripts/server-setup.sh | bash
#
# Option B — Manual:
#   1. Install Docker:  curl -fsSL https://get.docker.com | sh
#   2. Clone repo:      git clone https://github.com/senzdigitalsinc23/desa-uew-app.git /opt/desa-uew
#   3. Copy .env:       cp /opt/desa-uew/.env.staging /opt/desa-uew/.env
#   4. Edit .env:       nano /opt/desa-uew/.env  (fill in secrets)
#   5. Build & run:     cd /opt/desa-uew && docker compose up -d --build
#
# ─────────────────────────────────────────────────────────────────
#
# Step 2: Configure GitHub Secrets
# ─────────────────────────────────────────────────────────────────
#
# Go to: https://github.com/senzdigitalsinc23/desa-uew-app/settings/secrets/actions
#
# Add these 3 secrets:
#
#   DEPLOY_HOST     — Your server's public IP or domain
#                   Example: 45.123.45.67  or  staging.desauew.com
#
#   DEPLOY_USER     — SSH username with sudo access
#                   Example: ubuntu  or  deploy
#
#   DEPLOY_KEY      — SSH private key (copy-paste the entire key)
#                   Get it with:  cat ~/.ssh/id_rsa  (or your key file)
#
# To generate a deploy key (recommended, limited access):
#   ssh-keygen -t ed25519 -C "desa-deploy" -f ~/desa-deploy-key -N ""
#   # Copy the public key to your server:
#   ssh-copy-id -i ~/desa-deploy-key.pub user@SERVER_IP
#   # Store the PRIVATE key as DEPLOY_KEY secret above
