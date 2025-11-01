#!/bin/bash
set -e

echo "🔨 Building TaskFlow Backend..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
yarn prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
yarn prisma:migrate --skip-generate || true

# Compile TypeScript
echo "⚙️  Compiling TypeScript..."
yarn build

echo "✅ Build complete!"
