#!/bin/bash

echo "🚀 Setting up Tournament Database..."

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Create database if it doesn't exist
echo "📋 Creating database if it doesn't exist..."
createdb $DATABASE_NAME 2>/dev/null || echo "Database already exists or failed to create"

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run seed

echo "✅ Database setup completed!"
echo "🎯 You can now start the development server with: npm run start:dev"