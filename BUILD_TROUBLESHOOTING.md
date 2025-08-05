# 🔧 Build Troubleshooting Guide

## Issue: Vite Build Failure

**Error Message:**
```
[vite]: Rollup failed to resolve import "/assets/index-DmY9N5Vu.js" from "/Users/peekay/projects/ai_news_chart/index.html".
This is most likely unintended because it can break your application at runtime.
```

## 🔧 Quick Fix

### Option 1: Use the Fixed Build Script
```bash
# The build.sh script has been updated to handle this issue
./build.sh
```

### Option 2: Use Simple Build (Recommended)
```bash
# Use the simple build script that doesn't rely on Vite
chmod +x simple-build.sh
./simple-build.sh
```

## 🛠️ Manual Fix

### Step 1: Fix index.html
The issue was caused by hardcoded asset references. This has been fixed:

**Before:**
```html
<script type="module" crossorigin src="/assets/index-DmY9N5Vu.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-BJM9_aTj.css">
```

**After:**
```html
<script type="module" src="/main.ts"></script>
<link rel="stylesheet" href="/styles.css">
```

### Step 2: Clean and Rebuild
```bash
# Clean previous build artifacts
rm -rf dist/
rm -rf node_modules/.vite/

# Reinstall dependencies (if needed)
npm install

# Try building again
npm run build
```

## 🎯 Alternative Solutions

### Option 1: Use Simple Build Script
The `simple-build.sh` script bypasses Vite entirely and creates a production build using TypeScript compiler directly.

### Option 2: Fix Vite Configuration
```bash
# Update vite.config.js to handle the build properly
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
})
EOF
```

### Option 3: Manual Production Build
```bash
# Create dist directory
mkdir -p dist

# Copy static files
cp styles.css dist/
cp index.html dist/

# Compile TypeScript manually
npx tsc main.ts --outDir dist --target ES2020 --module ES2020

# Copy to backend
cp -r dist/* backend/
```

## 🔍 Root Cause Analysis

The issue occurred because:
1. **Hardcoded asset references** in index.html
2. **Vite build cache** containing old references
3. **Asset resolution** failing during build process

## 🚀 Recommended Solution

**Use the simple build script:**
```bash
./simple-build.sh
```

This approach:
- ✅ Bypasses Vite build issues
- ✅ Creates a clean production build
- ✅ Handles TypeScript compilation directly
- ✅ Avoids asset resolution problems

## 📊 Expected Results

**Before fix:**
- ❌ Vite build failure
- ❌ Asset resolution errors
- ❌ Missing dist/ directory

**After fix:**
- ✅ Successful build
- ✅ Clean dist/ directory
- ✅ Ready for deployment

## 🆘 If Issues Persist

1. **Use simple-build.sh** (most reliable)
2. **Clear all caches** and rebuild
3. **Check TypeScript configuration**
4. **Verify all dependencies are installed**

## 📞 Support Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Rollup Documentation](https://rollupjs.org/guide/en/) 