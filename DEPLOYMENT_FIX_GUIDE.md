# 🚨 Deployment Fix Guide

## Issues Found:
1. **MIME type error** - Server serving TypeScript files with wrong MIME type
2. **Backend not running** - Flask API not responding
3. **Frontend not loading** - JavaScript modules not loading properly

## 🔧 Quick Fix

### Step 1: Rebuild with Proper JavaScript
```bash
# Use the simple build script to create proper JS files
chmod +x simple-build.sh
./simple-build.sh
```

### Step 2: Redeploy
```bash
gcloud app deploy
```

## 🛠️ What Was Fixed

### 1. MIME Type Configuration
**Updated `app.yaml`:**
```yaml
handlers:
  - url: /(.*\.js)
    static_files: \1
    upload: (.*\.js)
    mime_type: application/javascript
    
  - url: /(.*\.css)
    static_files: \1
    upload: (.*\.css)
    mime_type: text/css
```

### 2. Frontend File Serving
**Added to `backend/app.py`:**
```python
from flask import send_from_directory

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)
```

### 3. Build Process
**Updated `simple-build.sh`:**
- Compiles TypeScript to JavaScript
- Places JS files in `/assets/` directory
- Updates HTML to reference compiled JS

## 🔍 Root Cause Analysis

### Issue 1: MIME Type Error
**Problem:** App Engine was serving `.ts` files with wrong MIME type
**Solution:** Added explicit MIME type configuration

### Issue 2: Backend Not Running
**Problem:** Flask app wasn't serving frontend files
**Solution:** Added static file serving routes

### Issue 3: Module Loading
**Problem:** Browser trying to load TypeScript directly
**Solution:** Compile TypeScript to JavaScript first

## 🚀 Complete Fix Process

```bash
# 1. Fix the build
./simple-build.sh

# 2. Deploy
gcloud app deploy

# 3. Test
gcloud app browse
```

## 📊 Expected Results

**Before fix:**
- ❌ MIME type error in browser console
- ❌ Backend API not responding
- ❌ Frontend not loading

**After fix:**
- ✅ Proper JavaScript loading
- ✅ Backend API responding
- ✅ Frontend working correctly

## 🔍 Verification Steps

### 1. Check Backend API
```bash
# Test health endpoint
curl https://YOUR_PROJECT_ID.appspot.com/api/health
```

### 2. Check Frontend Loading
- Open browser developer tools
- Look for successful JavaScript loading
- No MIME type errors

### 3. Test Stock Chart
- Search for a stock (e.g., AAPL)
- Chart should load with data
- News should appear

## 🆘 If Issues Persist

### Option 1: Check Logs
```bash
gcloud app logs tail
```

### Option 2: Use Cloud Run
```bash
gcloud run deploy ai-news-chart \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Option 3: Manual Debug
1. Check if files are in the right location
2. Verify MIME types are correct
3. Test API endpoints individually

## 📞 Support Resources

- [App Engine Static Files](https://cloud.google.com/appengine/docs/standard/python/serving-static-files)
- [Flask Static Files](https://flask.palletsprojects.com/en/2.3.x/quickstart/#static-files)
- [TypeScript Compilation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) 