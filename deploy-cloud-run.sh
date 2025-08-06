#!/bin/bash

# Cloud Run Deployment Script
echo "🚀 Deploying to Google Cloud Run..."

# Set your project ID
PROJECT_ID="ai-news-chart-20250804"
SERVICE_NAME="ai-news-chart"
REGION="us-west1"

# Build the frontend first
echo "🔨 Building frontend..."
./simple-build.sh

# Build the Docker image
echo "📦 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 80 \
  --max-instances 10 \
  --set-env-vars FLASK_ENV=production

echo "✅ Deployment complete!"
echo "🌐 Your app is available at:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 