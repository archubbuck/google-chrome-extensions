#!/bin/bash

# Script to package the Screener Saver extension for Chrome Web Store
# Usage: ./scripts/package-extension.sh

set -euo pipefail

echo "📦 Packaging Screener Saver extension..."

# Build the extension
echo "🔨 Building extension..."
npx nx build screener-saver

# Package it
echo "📦 Creating ZIP package..."
pushd apps/screener-saver/dist > /dev/null
zip -r ../screener-saver.zip .
popd > /dev/null

# Get file size
SIZE=$(du -h apps/screener-saver/screener-saver.zip | cut -f1)

echo "✅ Extension packaged successfully!"
echo "📍 Location: apps/screener-saver/screener-saver.zip"
echo "📊 Size: $SIZE"
echo ""
echo "You can now upload this file to the Chrome Web Store:"
echo "  https://chrome.google.com/webstore/devconsole"
