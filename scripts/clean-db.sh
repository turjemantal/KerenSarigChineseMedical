#!/bin/bash
set -e

echo "🗑️  Dropping database keren-clinic..."
docker exec keren-mongo mongosh keren-clinic --quiet --eval "db.dropDatabase()"
echo "✅ Database dropped."
