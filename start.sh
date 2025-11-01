#!/bin/bash
set -e

echo "🚀 Starting TaskFlow Backend..."
cd backend
node dist/server.js
