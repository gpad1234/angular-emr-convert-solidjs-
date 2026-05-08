#!/usr/bin/env bash
# =============================================================================
# deploy-remote.sh — Run this on your LOCAL MACHINE to deploy to the droplet.
#
# Usage:
#   ./deploy-remote.sh          # deploys to default droplet
#   ./deploy-remote.sh 1.2.3.4  # deploys to a different IP
#
# Prerequisites:
#   - SSH access to root@<droplet> (key-based)
#   - Git remote set to the GitHub repo
# =============================================================================

set -euo pipefail

DROPLET_IP="${1:-142.93.62.131}"
DROPLET_USER="sam"
REPO_URL="https://github.com/gpad1234/python-fast-api-react-mobile-emr.git"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploying Diabetes EMR → $DROPLET_USER@$DROPLET_IP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Verify SSH access ─────────────────────────────────────────────────────────
echo "▶  Verifying SSH access..."
ssh -o ConnectTimeout=10 -o BatchMode=yes "$DROPLET_USER@$DROPLET_IP" "echo 'SSH OK'" 2>/dev/null \
    || { echo "✗ Cannot reach $DROPLET_USER@$DROPLET_IP — ensure SSH key is authorized"; exit 1; }

# ── Copy sam's SSH key to authorized_keys (first-time setup) ─────────────────
# This section is a no-op if already done.
echo "▶  Ensuring sam can pull from GitHub (no key needed — HTTPS clone)..."

# ── Run the server-side deploy script via SSH ─────────────────────────────────
echo "▶  Executing deploy.sh on the droplet..."
ssh "$DROPLET_USER@$DROPLET_IP" "bash -s" < deploy/deploy.sh

echo ""
echo "Done. Visit http://$DROPLET_IP"
