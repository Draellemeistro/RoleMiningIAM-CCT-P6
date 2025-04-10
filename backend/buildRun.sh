#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the frontend directory and build the frontend
echo "Building frontend..."
cd "$(dirname "$0")/../frontend"
npm install # Install dependencies if not already installed
npm run build

# Navigate to the backend directory and start the server
echo "Starting backend server..."
cd ../backend
npm install # Install dependencies if not already installed

# node index.js
npm run dev # For development mode

# Notify the user
echo "Build and run completed. Server is running."
