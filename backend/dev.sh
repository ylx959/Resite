#!/usr/bin/env bash
# Local dev server: creates .venv, installs requirements when they change, runs uvicorn with reload.
set -euo pipefail
cd "$(dirname "$0")"

PYTHON="${PYTHON:-python3}"
VENV=".venv"
STAMP="$VENV/.requirements.sha"

if [ ! -x "$VENV/bin/python" ]; then
  echo "→ creating $VENV"
  "$PYTHON" -m venv "$VENV"
fi

hash="$(shasum requirements.txt | cut -d' ' -f1)"
if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$hash" ]; then
  echo "→ installing requirements"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet -r requirements.txt
  echo "$hash" > "$STAMP"
fi

exec "$VENV/bin/uvicorn" app.main:app --reload --host "${HOST:-127.0.0.1}" --port "${PORT:-8000}"
