#!/usr/bin/env bash
# Firestore エミュレータ + Go バックエンド + フロントを一括起動
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-shiori-dev}"

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$GO_PID" ] && kill "$GO_PID" 2>/dev/null || true
  [ -n "$EMU_PID" ] && kill "$EMU_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

cd "$ROOT"

echo "Starting Firestore emulator (project: $PROJECT_ID)..."
firebase emulators:start --only firestore --project "$PROJECT_ID" &
EMU_PID=$!

echo "Waiting for emulator to be ready..."
for _ in $(seq 1 30); do
  (nc -z 127.0.0.1 9090 2>/dev/null) && break
  sleep 1
done
sleep 2

echo "Building Go backend..."
cd "$ROOT/backend"
go build -o server .
echo "Starting Go backend..."
FIRESTORE_EMULATOR_HOST=127.0.0.1:9090 GOOGLE_CLOUD_PROJECT="$PROJECT_ID" CORS_ALLOWED_ORIGIN=http://localhost:3000 ./server &
GO_PID=$!
cd "$ROOT"
sleep 2

echo "Starting frontend (http://localhost:3000)..."
cd "$ROOT/frontend"
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
