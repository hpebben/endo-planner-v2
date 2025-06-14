#!/usr/bin/env bash
set -euo pipefail

# 1. sync
git fetch origin
git checkout main
git reset --hard origin/main

# 2. install & build
npm ci
npm run build

# 3. commit built assets
git add -A
git commit -m "build: update compiled assets"

# 4. drop any existing tag for the current version
VER=v$(node -p "require('./package.json').version")
git tag -d "$VER" >/dev/null 2>&1 || true
git push origin :"$VER" >/dev/null 2>&1 || true

# 5. bump patch (this updates package.json + endo-planner.php, commits + tags)
npm version patch

# 6. push it all up
git push origin main --follow-tags
