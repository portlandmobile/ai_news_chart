#!/bin/bash

echo "🚀 Starting Interactive Stock Chart Application"
echo "================================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Start backend server in background
echo "🔧 Starting backend server on http://localhost:5001"
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to root directory
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start frontend server
echo "🎨 Starting frontend server on http://localhost:5173"
echo "================================================"
echo "🌐 Backend: http://localhost:5001"
echo "🎨 Frontend: http://localhost:5173"
echo "================================================"
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start frontend
npm run dev

# If we get here, frontend has stopped
cleanup 