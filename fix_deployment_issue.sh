#!/bin/bash

echo "🔧 Fixing Google Cloud deployment issue..."

echo "📊 Current file descriptor limits:"
ulimit -n

echo "🚀 Increasing file descriptor limit for this session..."
ulimit -n 65536

echo "📊 New file descriptor limit:"
ulimit -n

echo "🧹 Cleaning up deployment files..."
# Remove any partial deployment artifacts
rm -rf .gcloudignore
rm -rf .gcloudignore.bak

echo "📝 Creating .gcloudignore file to reduce deployment size..."
cat > .gcloudignore << 'EOF'
# Node modules (will be built)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Development files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Build artifacts (will be rebuilt)
dist/
build/

# Logs
*.log
logs/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Cache directories
.cache/
.parcel-cache/

# Temporary files
tmp/
temp/

# Python cache
__pycache__/
*.py[cod]
*$py.class
*.so

# Virtual environments
venv/
env/
ENV/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Documentation
README.md
DEPLOYMENT.md
COST_COMPARISON.md
GCloud_Setup_Guide.txt
fix_deployment_issue.sh

# Development scripts
start.sh 