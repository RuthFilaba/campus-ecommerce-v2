#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
venv_python="$repo_root/.venv/bin/python"

if [[ ! -x "$venv_python" ]]; then
  echo "Development environment not found. Run: bash scripts/setup-dev.sh" >&2
  exit 1
fi

if [[ ! -d "$repo_root/frontend/node_modules" ]]; then
  echo "Frontend dependencies not found. Run: bash scripts/setup-dev.sh" >&2
  exit 1
fi

backend_pid=""
frontend_pid=""

stop_servers() {
  trap - INT TERM EXIT
  for server_pid in "$backend_pid" "$frontend_pid"; do
    if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
      kill "$server_pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
}

trap stop_servers INT TERM EXIT

(
  cd "$repo_root/backend"
  exec "$venv_python" manage.py runserver 127.0.0.1:8000
) &
backend_pid=$!

(
  cd "$repo_root/frontend"
  exec npm run dev -- --host 127.0.0.1
) &
frontend_pid=$!

echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:5173"
echo "Press Ctrl+C to stop both servers."

wait -n "$backend_pid" "$frontend_pid"
