#!/bin/bash
set -e

ARCHIVE=$1

if [ -z "$ARCHIVE" ]; then
  echo "Usage: ./scripts/restore-db.sh <path-to-archive>"
  echo "Example: ./scripts/restore-db.sh backups/20260608_120000/keren-clinic.archive"
  exit 1
fi

if [ ! -f "$ARCHIVE" ]; then
  echo "❌ Archive not found: $ARCHIVE"
  exit 1
fi

echo "♻️  Restoring keren-clinic from ${ARCHIVE}..."

cat "$ARCHIVE" | docker exec -i keren-mongo mongorestore \
  --db keren-clinic \
  --archive \
  --drop \
  --quiet

echo "✅ Restore complete."
