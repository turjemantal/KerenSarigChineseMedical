#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

mkdir -p "$BACKUP_PATH"

echo "💾 Backing up keren-clinic to ${BACKUP_PATH}..."

docker exec keren-mongo mongodump \
  --db keren-clinic \
  --archive \
  --quiet \
  | cat > "${BACKUP_PATH}/keren-clinic.archive"

echo "✅ Backup saved to ${BACKUP_PATH}/keren-clinic.archive"
