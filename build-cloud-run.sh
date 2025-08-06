#!/bin/bash

echo "🚀 Building for Google Cloud Run..."

# Increase file descriptor limit
ulimit -n 65536

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist/
rm -rf backend/dist/
rm -f backend/app.py backend/requirements.txt

# Build frontend using simple-build.sh
echo "🔨 Building frontend..."
./simple-build.sh

# Verify the build
if [ ! -f "assets/main.js" ]; then
    echo "❌ Frontend build failed - assets/main.js not found"
    exit 1
fi

if [ ! -f "app.py" ]; then
    echo "❌ Backend files not found - app.py not found"
    exit 1
fi

echo "✅ Build complete! Ready for Cloud Run deployment."
echo "📦 Files ready for Docker build:"
echo "   - app.py (Flask backend)"
echo "   - requirements.txt (Python dependencies)"
echo "   - assets/main.js (Compiled frontend)"
echo "   - index.html (Main HTML file)"
echo "   - styles.css (Styling)"
echo ""
echo "🚀 Next step: Run ./deploy-cloud-run.sh" 