#!/usr/bin/env bash
set -euo pipefail

STATE_FILE="/opt/www/deploy/paramount_pmx_active_slot.env"
if [ ! -f "${STATE_FILE}" ]; then
  echo "❌ STATE_FILE not found: ${STATE_FILE}"
  exit 1
fi

# shellcheck disable=SC1090
source "${STATE_FILE}"

if [ -z "${ACTIVE_PORT:-}" ] || [ -z "${ACTIVE_SERVICE:-}" ]; then
  echo "❌ ACTIVE info missing in state file"
  exit 1
fi

echo "▶ Validate active service is running: ${ACTIVE_SERVICE}"
systemctl is-active --quiet "${ACTIVE_SERVICE}"

echo "▶ Validate active health endpoint: http://127.0.0.1:${ACTIVE_PORT}/health"
curl -sf "http://127.0.0.1:${ACTIVE_PORT}/health" > /dev/null

echo "✅ ValidateService passed"