#!/usr/bin/env bash
set -euo pipefail

# systemd 서비스명
SERVICE_NAME="paramount-cms-dev"

# 헬스체크 URL
HEALTHCHECK_URL="http://localhost:2022/health"

# 최대 대기 시간(초) / 체크 간격(초)
MAX_WAIT=180
INTERVAL=3

echo "▶ Validate systemd service is active"
systemctl is-active --quiet "${SERVICE_NAME}"

echo "▶ Waiting for application health check..."
elapsed=0

while true; do
  # HTTP 2xx 응답이면 성공
  if curl -sf "${HEALTHCHECK_URL}" > /dev/null; then
    echo "✅ Health check passed"
    exit 0
  fi

  # 타임아웃 초과 시 실패 처리
  if [ "${elapsed}" -ge "${MAX_WAIT}" ]; then
    echo "❌ Health check failed (timeout ${MAX_WAIT}s)"
    echo "▶ Mark deployment as FAILED (CodeDeploy auto rollback will start)"
    exit 1
  fi

  sleep "${INTERVAL}"
  elapsed=$((elapsed + INTERVAL))
done