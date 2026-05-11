#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

LAN_IP=$(
  ipconfig getifaddr en0 2>/dev/null ||
  ipconfig getifaddr en1 2>/dev/null ||
  hostname -I 2>/dev/null | awk '{print $1}' ||
  echo "127.0.0.1"
)

export EXPO_PUBLIC_API_URL="http://$LAN_IP:4000"

cleanup() {
  echo ""
  echo "Stopping CareBridge servers..."
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

echo "Starting CareBridge backend on http://localhost:4000"
echo "Mobile API URL: $EXPO_PUBLIC_API_URL"
npm run backend &
BACKEND_PID=$!

sleep 2

echo "Starting Expo mobile app..."
echo "Scan the QR code with Expo Go when it appears."
npx expo start --host lan
