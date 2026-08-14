#!/usr/bin/env bash
set -euo pipefail

# CodeDeploy가 내려준 jar
SRC_JAR="/opt/paramount-pmx-app/app.jar"

# jar 배치 경로
JAR_DIR="/opt/www"
PROD1_JAR="${JAR_DIR}/paramount-pmx-prod1.jar"
PROD2_JAR="${JAR_DIR}/paramount-pmx-prod2.jar"

# nginx 전환 파일 (너가 쓰던 방식 그대로)
NGINX_TARGET_FILE="/etc/nginx/conf.d/service-paramount-pmx-url.inc"

# 상태 파일(배포 성공 후 참고용으로 기록)
STATE_FILE="/opt/www/deploy/paramount_pmx_active_slot.env"

# 서비스/포트 정의
PROD1_SERVICE="paramount-pmx-prod1"
PROD2_SERVICE="paramount-pmx-prod2"

PROD1_PORT="2023"
PROD2_PORT="2024"

mkdir -p "$(dirname "${STATE_FILE}")"

# 실제 nginx가 바라보는 현재 active 포트 확인
CURRENT_PORT=$(grep -oE '127\.0\.0\.1:[0-9]+' "${NGINX_TARGET_FILE}" | head -n1 | cut -d: -f2 || true)

# nginx 기준으로 ACTIVE / IDLE 계산
if [ "${CURRENT_PORT}" = "${PROD1_PORT}" ]; then
  ACTIVE="prod1"
  ACTIVE_SERVICE="${PROD1_SERVICE}"
  ACTIVE_PORT="${PROD1_PORT}"

  IDLE="prod2"
  IDLE_SERVICE="${PROD2_SERVICE}"
  IDLE_PORT="${PROD2_PORT}"

  RUN_JAR_PATH="${PROD2_JAR}"

elif [ "${CURRENT_PORT}" = "${PROD2_PORT}" ]; then
  ACTIVE="prod2"
  ACTIVE_SERVICE="${PROD2_SERVICE}"
  ACTIVE_PORT="${PROD2_PORT}"

  IDLE="prod1"
  IDLE_SERVICE="${PROD1_SERVICE}"
  IDLE_PORT="${PROD1_PORT}"

  RUN_JAR_PATH="${PROD1_JAR}"

else
  echo "❌ Invalid nginx current port: ${CURRENT_PORT}"
  echo "❌ Check file: ${NGINX_TARGET_FILE}"
  exit 1
fi

echo "▶ Current active from nginx: ${ACTIVE} (${ACTIVE_PORT})"
echo "▶ Deploy target idle slot: ${IDLE} (${IDLE_PORT})"

echo "▶ Copy jar to idle slot: ${SRC_JAR} -> ${RUN_JAR_PATH}"
cp -f "${SRC_JAR}" "${RUN_JAR_PATH}"
chown ubuntu:ubuntu "${RUN_JAR_PATH}"

# (선택) 혹시 이전 프로세스가 남아있으면 정리하고 시작하고 싶다면 stop 먼저
# 무중단 배포 하려면 주석처리 해야함
# systemctl stop "${IDLE_SERVICE}" || true

echo "▶ Start idle service: ${IDLE_SERVICE}"
systemctl restart "${IDLE_SERVICE}"

echo "▶ Wait for idle service health: http://127.0.0.1:${IDLE_PORT}/health"
# 여기서는 "전환하기 전" 최소한의 헬스 확인을 수행 (전환 실패 방지)
MAX_WAIT=180
INTERVAL=3
elapsed=0

while true; do
  if curl -sf "http://127.0.0.1:${IDLE_PORT}/health" > /dev/null; then
    echo "✅ Idle slot is healthy: ${IDLE} (${IDLE_PORT})"
    break
  fi

  if [ "${elapsed}" -ge "${MAX_WAIT}" ]; then
    echo "❌ Idle health check failed. Mark deployment as FAILED (auto rollback will trigger)"
    systemctl stop "${IDLE_SERVICE}" || true
    exit 1
  fi

  sleep "${INTERVAL}"
  elapsed=$((elapsed + INTERVAL))
done

echo "▶ Switch Nginx upstream to idle port: ${IDLE_PORT}"
echo "set \$service_url http://127.0.0.1:${IDLE_PORT};" | tee "${NGINX_TARGET_FILE}" > /dev/null

echo "▶ Reload Nginx"
systemctl reload nginx

# 전환 완료 후 기존(active) 슬롯 종료 (무중단)
if [ "${ACTIVE}" = "prod1" ] || [ "${ACTIVE}" = "prod2" ]; then
  echo "▶ Stop previous active service: ${ACTIVE_SERVICE}"
  systemctl stop "${ACTIVE_SERVICE}" || true
else
  echo "▶ No active slot to stop (first deploy)"
fi

# 다음 배포를 위해 "현재 active" 기록 업데이트
cat > "${STATE_FILE}" <<EOF
ACTIVE=${IDLE}
ACTIVE_SERVICE=${IDLE_SERVICE}
ACTIVE_PORT=${IDLE_PORT}
IDLE=${ACTIVE}
IDLE_SERVICE=${ACTIVE_SERVICE}
IDLE_PORT=${ACTIVE_PORT}
EOF

echo "✅ Deploy finished: active=${IDLE} port=${IDLE_PORT}"