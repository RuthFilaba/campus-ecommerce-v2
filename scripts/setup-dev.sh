#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
venv_dir="$repo_root/.venv"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. Install Node.js 18 or newer, then rerun this script." >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  system_python="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  system_python="$(command -v python)"
else
  echo "Error: Python 3.10 or newer is required." >&2
  exit 1
fi

if [[ ! -x "$venv_dir/bin/python" ]]; then
  "$system_python" -m venv "$venv_dir"
fi

"$venv_dir/bin/python" -m pip install --upgrade pip
"$venv_dir/bin/python" -m pip install -r "$repo_root/requirements.txt"
npm install --prefix "$repo_root/frontend"
"$venv_dir/bin/python" "$repo_root/backend/manage.py" migrate

echo "Development dependencies are ready. See DEVELOPMENT.md to start the frontend and backend servers."
