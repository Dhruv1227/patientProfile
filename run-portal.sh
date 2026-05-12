#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR"

MODE="${1:-both}"

case "$MODE" in
  mobile|web|both) ;;
  *)
    echo "Usage: ./run-portal.sh [mobile|web|both]"
    echo ""
    echo "  mobile  Start Expo for Expo Go / emulator"
    echo "  web     Start Expo directly in web mode"
    echo "  both    Start Expo LAN mode for Expo Go, then press w for web"
    exit 1
    ;;
esac

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

case "$MODE" in
  mobile)
    echo "Starting Expo mobile app..."
    echo "Scan the QR code with Expo Go when it appears."
    npx expo start --clear --host lan
    ;;
  web)
    echo "Starting Expo web app..."
    echo "Chrome/web preview will open from the Expo dev server."
    npx expo start --web --clear --host lan
    ;;
  both)
    echo "Starting Expo for mobile and web..."
    echo "Scan the QR code with Expo Go for mobile."
    echo "Press w in this terminal to open the web version."
    npx expo start --clear --host lan
    ;;
esac
