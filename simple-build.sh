#!/bin/bash

echo "🚀 Simple Build for Google Cloud deployment..."

# Increase file descriptor limit
echo "🔧 Setting file descriptor limit..."
ulimit -n 65536

# Clean up any previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist/
rm -rf backend/dist/
rm -f app.py requirements.txt

# Create a simple production build without Vite
echo "📦 Creating simple production build..."

# Create dist directory
mkdir -p dist/assets

# Copy and process main.ts to a simple JS file
echo "📝 Processing TypeScript..."
npx tsc main.ts --outDir dist/assets --target ES2020 --module ES2020 --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop

# Copy static files
echo "📋 Copying static files..."
cp styles.css dist/
cp index.html dist/

# Update index.html for production
echo "🔧 Updating index.html for production..."
sed -i '' 's|src="/main.ts"|src="/assets/main.js"|g' dist/index.html

# Copy built frontend files to backend directory
echo "📋 Copying frontend files to backend..."
cp -r dist/* backend/

# Copy only necessary backend files to root for App Engine
echo "📋 Preparing App Engine deployment..."
cp backend/app.py .
cp backend/requirements.txt .
cp app.yaml .

echo "✅ Simple build complete! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. gcloud app deploy"
echo "2. gcloud app browse" 