#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting local deployment…"

# 1. Switch to main and make sure it’s up-to-date
git checkout main
git pull --ff-only origin main

# 2. Auto-commit any stray edits (so we never leave uncommitted changes lying around)
echo "📝 Checking for unstaged changes…"
if ! git diff --quiet || ! git diff --quiet --staged; then
  git add -A
  git commit -m "chore: auto-commit local edits before build"
fi

# 3. Clean install & build
echo "🔧 Installing dependencies (with legacy peer-deps)…"
npm ci --legacy-peer-deps

echo "📦 Building production assets…"
npm run build

# 4. Commit your freshly built files
echo "📝 Staging build output…"
git add build src endo-planner.php package.json package-lock.json

if ! git diff --quiet --cached; then
  git commit -m "build: update compiled assets"
fi

# 5. Bump the patch version (edits package.json & PHP header, creates vX.Y.Z tag)
echo "🔖 Bumping patch version…"
npm version patch --git-tag-version --message "chore: bump version to %s"

# 6. Push everything (code, assets, tags) up to GitHub
echo "🚀 Pushing commits and tags…"
git push origin main --follow-tags

echo "✅ Local deploy complete!  Now SSH into your server and run:"
echo "   cd /path/to/wp-content/plugins/endo-planner-v2"
echo "   git pull --ff-only origin main"
