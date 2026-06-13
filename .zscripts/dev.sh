#!/bin/bash
set -e

cd /home/z/my-project

echo "[DEV] Installing dependencies..."
bun install

echo "[DEV] Generating Prisma client..."
npx prisma generate

echo "[DEV] Pushing database schema..."
npx prisma db push

echo "[DEV] Building Next.js..."
npx next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

echo "[DEV] Starting server with pm2..."
pm2 delete linkforge 2>/dev/null || true
pm2 start "node node_modules/.bin/next dev -p 3000" --name linkforge
pm2 save

echo "[DEV] Waiting for server to be ready..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "[DEV] Server is ready!"
    exit 0
  fi
  sleep 1
done

echo "[DEV] Warning: Server may still be starting..."
