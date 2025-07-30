#!/bin/bash

echo "⚠️  WARNING: This will completely reset your database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | xargs)
    else
        echo "❌ .env file not found."
        exit 1
    fi

    echo "🗑️  Dropping database..."
    dropdb $DATABASE_NAME 2>/dev/null || echo "Database doesn't exist or failed to drop"

    echo "📋 Creating fresh database..."
    createdb $DATABASE_NAME

    echo "🔄 Running migrations..."
    npm run migration:run

    echo "🌱 Seeding database..."
    npm run seed

    echo "✅ Database reset completed!"
else
    echo "Operation cancelled."
fi
