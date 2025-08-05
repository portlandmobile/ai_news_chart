# 🚀 Google Cloud Deployment Guide

This guide will walk you through deploying the AI News Chart application to Google Cloud Platform.

## Prerequisites

- ✅ Google Cloud account with billing enabled
- ✅ Google Cloud CLI (gcloud) installed
- ✅ Existing Google Cloud project

## Option 1: App Engine Deployment (Recommended)

### Step 1: Install Google Cloud CLI (if not already installed)

```bash
# macOS
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate and Set Project

```bash
# Login to Google Cloud
gcloud auth login

# List your projects
gcloud projects list

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable App Engine API
gcloud services enable appengine.googleapis.com
```

### Step 3: Build and Deploy

```bash
# Make sure you're in the project directory
cd /Users/peekay/projects/ai_news_chart

# Run the build script
./build.sh

# Deploy to App Engine
gcloud app deploy

# Open the deployed application
gcloud app browse
```

### Step 4: Verify Deployment

- Visit your app URL (usually `https://YOUR_PROJECT_ID.appspot.com`)
- Test the stock chart functionality
- Check that news data is loading

## Option 2: Cloud Run Deployment (Alternative)

If you prefer Cloud Run for more control:

### Step 1: Create Dockerfile

```dockerfile
# Use the official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Build frontend
RUN npm install
RUN npm run build

# Copy built frontend to backend
RUN cp -r dist/* backend/

# Expose port
EXPOSE 8080

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "backend.app:app"]
```

### Step 2: Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy ai-news-chart \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## Option 3: Cloud Functions + Static Hosting

For a serverless approach:

### Step 1: Deploy Backend to Cloud Functions

```bash
# Deploy the Flask API as a Cloud Function
gcloud functions deploy ai-news-api \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --source backend/
```

### Step 2: Deploy Frontend to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Build frontend
npm run build

# Deploy to Firebase
firebase deploy
```

## Configuration Files

### app.yaml (App Engine)
- Configures Python runtime
- Sets up static file serving
- Defines scaling parameters

### requirements.txt (Backend Dependencies)
- Flask web framework
- yfinance for stock data
- pandas for data processing
- gunicorn for production server

### build.sh (Build Script)
- Builds frontend with Vite
- Copies files to deployment structure
- Prepares for App Engine deployment

## Environment Variables

For production, consider setting these environment variables:

```bash
# In app.yaml or Cloud Run configuration
env_variables:
  FLASK_ENV: production
  API_KEY: your_api_key_here
  CORS_ORIGIN: https://yourdomain.com
```

## Monitoring and Logging

### View Logs
```bash
# App Engine logs
gcloud app logs tail

# Cloud Run logs
gcloud logs read --filter resource.type="cloud_run_revision"
```

### Monitor Performance
- Use Google Cloud Console
- Set up alerts for errors
- Monitor API response times

## Cost Optimization

### App Engine - Scale to Zero Configuration
The current `app.yaml` is configured to **scale to zero** when there's no traffic:

```yaml
automatic_scaling:
  min_instances: 0  # No instances when no traffic
  min_idle_instances: 0  # No idle instances
  max_idle_instances: 0  # No idle instances
```

**What this means:**
- ✅ **$0 cost when no users** - App scales down to zero instances
- ✅ **On-demand startup** - Instances start when first request arrives
- ⚠️ **Cold start delay** - First request may take 2-5 seconds
- ✅ **Auto-scaling** - Scales up automatically with traffic

### Cost-Effective Alternative
Use `app-cost-optimized.yaml` for even more savings:

```bash
# Deploy with cost-optimized config
gcloud app deploy app-cost-optimized.yaml
```

**Cost optimization features:**
- Higher CPU utilization (80% vs 65%)
- Lower max instances (5 vs 10)
- Longer startup tolerance for better scaling
- 2-minute cooldown before scaling down

### Expected Monthly Costs
- **No traffic**: $0-1/month (just storage)
- **Light traffic (100 requests/day)**: $2-5/month
- **Moderate traffic (1000 requests/day)**: $10-20/month
- **Heavy traffic (10000 requests/day)**: $50-100/month

### Cloud Run
- Pay only for actual usage
- Set concurrency limits
- Use appropriate memory allocation

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version
   
   # Clear npm cache
   npm cache clean --force
   ```

2. **Deployment Errors**
   ```bash
   # Check gcloud version
   gcloud version
   
   # Update gcloud
   gcloud components update
   ```

3. **API Issues**
   - Check CORS settings
   - Verify API endpoints
   - Check network connectivity

### Support Resources
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [App Engine Guides](https://cloud.google.com/appengine/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure SSL certificates**
3. **Set up monitoring and alerts**
4. **Implement CI/CD pipeline**
5. **Add authentication** (if needed)

## Security Considerations

- Enable HTTPS
- Set up proper CORS policies
- Use environment variables for secrets
- Regular security updates
- Monitor for vulnerabilities

---

**Need Help?** Check the [Google Cloud Status Dashboard](https://status.cloud.google.com/) for service issues. 