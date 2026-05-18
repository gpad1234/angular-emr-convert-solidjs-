#!/bin/bash
# start.sh — Start backend and frontend simultaneously
# =====================================================
# Usage: ./start.sh
#
# This script:
#   1. Installs backend Node.js dependencies (if needed)
#   2. Starts Express backend on port 8000
#   3. Installs frontend dependencies (if needed)
#   4. Starts Vue/Vite frontend on port 3000
#
# Both processes run in parallel. Press Ctrl+C to stop both.

set -e  # Exit on first error

# ── Color helpers ─────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'   # No color

echo -e "${BLUE}Diabetes EMR — Starting development servers${NC}"
echo "─────────────────────────────────────────────"

# ── Backend setup ─────────────────────────────────────────────────────────────
echo -e "${YELLOW}[Backend] Setting up Node.js environment...${NC}"

cd backend-node

# Create virtual environment if it doesn't exist
# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "[Backend] Installing npm packages..."
  npm install
fi

echo -e "${GREEN}[Backend] Starting Express API on http://localhost:8000${NC}"

# Start backend in background, capturing PID for cleanup
npm run dev &
BACKEND_PID=$!

# Return to root
cd ..

# ── Frontend setup ────────────────────────────────────────────────────────────
echo -e "${YELLOW}[Frontend] Setting up Node.js environment...${NC}"

cd frontend

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "[Frontend] Installing npm packages (this may take a minute)..."
  npm install
fi

echo -e "${GREEN}[Frontend] Starting Vue/Vite on http://localhost:3000${NC}"

# Start frontend in background, capturing PID for cleanup
npm run dev &
FRONTEND_PID=$!

# Return to root
cd ..

# ── Wait and handle Ctrl+C ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}Both servers are starting up!${NC}"
echo "  App:  http://localhost:3000"
echo "  API:  http://localhost:8000/api/v1"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup function — kill both processes when script exits
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill $BACKEND_PID  2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo "Done."
}

# Register cleanup on Ctrl+C (SIGINT) and normal exit
trap cleanup SIGINT SIGTERM EXIT

# Wait for both background processes
wait $BACKEND_PID $FRONTEND_PID
