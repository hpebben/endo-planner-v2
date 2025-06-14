#!/usr/bin/env bash
set -euo pipefail

# 1. Make sure we're on main and up-to-date
git checkout main
git fetch origin
git pull --ff-only origin main

# 2. Auto-commit any local edits (deploy.sh itself, bump scripts, etc.)
if ! git diff-index --quiet HEAD --; then
  echo "📝 Auto-committing local changes before deploy…"
  git add -A
  git commit -m "chore: auto-commit local changes before deploy"
fi

# 3. Install & build
echo "🔧 Installing dependencies..."
npm ci

echo "📦 Building assets..."
npm run build

# 4. Commit built assets
echo "💾 Committing build artifacts..."
git add build
git commit -m "build: update compiled assets"

# 5. Bump patch version in package.json only (no auto-tag)
echo "⬆️  Bumping patch version in package.json..."
npm version patch --git-tag-version false

# 6. Sync plugin PHP version
echo "🔄 Syncing plugin PHP version..."
node scripts/bump-version.js

# 7. Commit version bump
VERSION=$(node -p "require('./package.json').version")
git add package.json endo-planner.php
git commit -m "chore: bump version to v$VERSION"

# 8. Tag the release
echo "🏷  Creating Git tag v$VERSION..."
git tag -a "v$VERSION" -m "Version v$VERSION"

# 9. Push commits & tags
echo "🚀 Pushing to origin/main…"
git push origin main --follow-tags

echo "✅ Deployed v$VERSION!"
