#!/bin/bash

echo "🔧 Fixing Google Cloud service account permissions..."

# Get the current project ID
PROJECT_ID=$(gcloud config get-value project)
echo "📋 Current project: $PROJECT_ID"

# Get the default service account
SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"
echo "🔑 Service account: $SERVICE_ACCOUNT"

echo "🚀 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable appengine.googleapis.com

echo "🔐 Setting up service account permissions..."

# Grant Cloud Build Service Account the necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/appengine.deployer"

echo "⏳ Waiting for permissions to propagate..."
sleep 30

echo "✅ Permissions setup complete!"
echo ""
echo "Next steps:"
echo "1. ./build.sh"
echo "2. gcloud app deploy" 