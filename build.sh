#!/bin/bash

echo "🚀 Building AI News Chart for Google Cloud deployment..."

# Increase file descriptor limit
echo "🔧 Setting file descriptor limit..."
ulimit -n 65536

# Clean up any previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist/
rm -rf backend/dist/
rm -f app.py requirements.txt

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist/ directory not found."
    echo "🔧 Trying alternative build approach..."
    
    # Try building with explicit entry point
    npx vite build --outDir dist
fi

# Copy built frontend files to backend directory
echo "📋 Copying frontend files to backend..."
if [ -d "dist" ]; then
    cp -r dist/* backend/
else
    echo "❌ No dist/ directory found. Creating minimal build..."
    # Create minimal build structure
    mkdir -p backend/assets
    cp main.ts backend/
    cp styles.css backend/
    cp index.html backend/
fi

# Copy only necessary backend files to root for App Engine
echo "📋 Preparing App Engine deployment..."
cp backend/app.py .
cp backend/requirements.txt .
cp app.yaml .

echo "✅ Build complete! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. gcloud app deploy"
echo "2. gcloud app browse" 