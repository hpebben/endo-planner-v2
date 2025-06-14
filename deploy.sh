#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting deployment…"

# 1. Make sure we're on main and up-to-date
git checkout main
git pull --ff-only origin main

# 2. Commit any stray changes (e.g. manual edits)
if ! git diff-index --quiet HEAD --; then
  echo "📝 Auto-committing local changes"
  git add .
  git commit -m "chore: auto-commit local changes before build"
fi

# 3. Install and build
echo "🔧 Installing dependencies"
npm ci

echo "📦 Building assets"
npm run build

# 4. Commit build artifacts if there are any
if ! git diff-index --quiet HEAD --; then
  echo "📝 Committing build artifacts"
  git add build
  git commit -m "build: update compiled assets"
fi

# 5. Bump patch version (runs your bump-version.js, updates PHP header, tags)
echo "🔖 Bumping patch version"
npm version patch -m "chore: bump version to %s"

# 6. Push everything
echo "🚀 Pushing commits and tags"
git push origin main --follow-tags

echo "✅ Deployment complete"
