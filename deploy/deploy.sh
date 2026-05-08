#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Remote deployment script for Diabetes EMR
# =============================================================================
# Runs on the DROPLET (not your local machine).
# Uploaded and executed by deploy-remote.sh.
#
# What it does:
#   1. Installs system dependencies (nginx, python3, node, npm)
#   2. Clones or pulls the latest code from GitHub
#   3. Builds the Python virtual environment and installs pip deps
#   4. Builds the Next.js production bundle
#   5. Installs systemd service files
#   6. Installs and enables the nginx config
#   7. Starts / restarts all services
#
# Idempotent: safe to run multiple times (re-running = redeploy).
# =============================================================================

set -euo pipefail

REPO_URL="https://github.com/gpad1234/python-fast-api-react-mobile-emr.git"
APP_DIR="/home/sam/app"
DEPLOY_DIR="$APP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Diabetes EMR — Deployment Script"
echo "  Target: $(hostname) | $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. System packages ────────────────────────────────────────────────────────
echo ""
echo "▶  Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq \
    git \
    python3 python3-pip python3-venv \
    nginx \
    curl

# Install Node.js 20 LTS if not already installed
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
    echo "  Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null
    sudo apt-get install -y -qq nodejs
fi
echo "  node $(node -v) | npm $(npm -v) | python3 $(python3 --version)"

# ── 2. Clone or update repo ───────────────────────────────────────────────────
echo ""
echo "▶  Syncing repository..."
if [ -d "$APP_DIR/.git" ]; then
    echo "  Pulling latest changes..."
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/main
else
    echo "  Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
echo "  HEAD: $(git log --oneline -1)"

# ── 3. Backend: Python virtual env + dependencies ────────────────────────────
echo ""
echo "▶  Setting up Python backend..."
cd "$APP_DIR/backend"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Always upgrade pip and install/update requirements
venv/bin/pip install --upgrade pip -q
venv/bin/pip install -r requirements.txt -q
echo "  FastAPI and dependencies installed."

# ── 4. Frontend: install npm deps + production build ─────────────────────────
echo ""
echo "▶  Building Next.js frontend..."
cd "$APP_DIR/frontend"

# Write the production .env.local
# API calls go through nginx (same origin), so no cross-origin needed.
cat > .env.local <<'EOF'
# Production: API is served by nginx on the same host
# /api/* requests are proxied to FastAPI by nginx — no cross-origin.
NEXT_PUBLIC_API_URL=
EOF

npm ci --prefer-offline --silent
npm run build
echo "  Next.js production build complete."

# ── 5. Systemd service files ──────────────────────────────────────────────────
echo ""
echo "▶  Installing systemd services..."

sudo cp "$APP_DIR/deploy/diabetes-api.service"      /etc/systemd/system/
sudo cp "$APP_DIR/deploy/diabetes-frontend.service" /etc/systemd/system/
sudo systemctl daemon-reload

sudo systemctl enable diabetes-api
sudo systemctl enable diabetes-frontend

sudo systemctl restart diabetes-api
sudo systemctl restart diabetes-frontend
echo "  Services started."

# ── 6. Nginx configuration ────────────────────────────────────────────────────
echo ""
echo "▶  Configuring nginx..."

sudo cp "$APP_DIR/deploy/nginx-diabetes-emr" /etc/nginx/sites-available/diabetes-emr

# Enable site (create symlink if not present)
if [ ! -L /etc/nginx/sites-enabled/diabetes-emr ]; then
    sudo ln -s /etc/nginx/sites-available/diabetes-emr \
               /etc/nginx/sites-enabled/diabetes-emr
fi

# Disable default nginx welcome page
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
echo "  Nginx configured and reloaded."

# ── 7. Health check ───────────────────────────────────────────────────────────
echo ""
echo "▶  Running health checks (waiting 5s for services to start)..."
sleep 5

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")

echo "  FastAPI  (port 8000): HTTP $API_STATUS"
echo "  Next.js  (port 3000): HTTP $FRONTEND_STATUS"
echo "  Nginx    (port 80):   HTTP $NGINX_STATUS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ "$NGINX_STATUS" == "200" ]]; then
    echo "  ✓ Deployment successful!"
    echo "  App: http://142.93.62.131"
    echo "  API docs: http://142.93.62.131/docs"
else
    echo "  ⚠  Nginx returned HTTP $NGINX_STATUS — check logs:"
    echo "     sudo journalctl -u diabetes-api -n 30"
    echo "     sudo journalctl -u diabetes-frontend -n 30"
    echo "     sudo tail -20 /var/log/nginx/diabetes-emr.error.log"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
