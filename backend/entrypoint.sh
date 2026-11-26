#!/usr/bin/env bash
set -e

echo "==> Waiting for database at ${DB_HOST}:${DB_PORT}..."
while ! python -c "
import sys, socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('${DB_HOST}', int('${DB_PORT}')))
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
"; do
  sleep 1
done

echo "==> Applying database migrations..."
python manage.py migrate --noinput

if [ "${SEED_DEMO_DATA}" = "true" ]; then
  echo "==> Seeding demo users..."
  python manage.py seed_demo_users || true
fi

echo "==> Starting backend server..."
exec "$@"
