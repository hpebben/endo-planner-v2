#!/usr/bin/env bash
set -euxo pipefail

echo "🚀 Starting deployment…"

# 1. Ensure we're on main and up-to-date
git checkout main
git pull --ff-only origin main

# 2. Stage & commit ANY local changes
echo "📝 Staging all changes…"
git add -A
if ! git diff-index --quiet HEAD --; then
  echo "📝 Committing local edits"
  git commit -m "chore: auto-commit local changes before build"
fi

# 3. Install dependencies and build
echo "🔧 Installing dependencies"
npm ci

echo "📦 Building assets"
npm run build

# 4. Stage & commit the build output
echo "📝 Staging built files…"
# adjust paths here if you have additional generated files
git add build src endo-planner.php package.json package-lock.json
if ! git diff-index --quiet HEAD --; then
  echo "📝 Committing built assets"
  git commit -m "build: update compiled assets"
fi

# 5. Bump the patch version (updates package.json, PHP header, creates tag)
echo "🔖 Bumping patch version"
npm version patch -m "chore: bump version to %s"

# 6. Push everything
echo "🚀 Pushing commits and tags…"
git push origin main --follow-tags

echo "✅ Deployment complete!"
