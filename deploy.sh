#!/usr/bin/env bash
set -euo pipefail
git pull
npm install
npm run build
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
echo "deployed at $(date)"
