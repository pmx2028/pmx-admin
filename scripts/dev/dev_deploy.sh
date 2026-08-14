#!/usr/bin/env bash
# bash 실행 + 에러 강제 종료 옵션
# -e : 중간에 실패하면 즉시 종료
# -u : 선언 안 된 변수 사용 시 오류
# -o pipefail : 파이프라인 중간 실패도 잡아냄
set -euo pipefail

# EC2에 미리 만들어둔 systemd 서비스명
# (예: /etc/systemd/system/total-cms-dev.service)
SERVICE_NAME="paramount-pmx-dev"

# systemd 서비스가 실행할 jar 경로
# (서비스 파일 ExecStart의 -jar 경로와 반드시 동일해야 함)
RUN_JAR_PATH="/opt/www/paramount-pmx-dev.jar"

# CodeDeploy가 배포 번들을 /opt/app에 풀어놓고,
# 워크플로우에서 deploy/app.jar로 넣었던 파일이 여기로 내려옴
SRC_JAR="/opt/paramount-pmx-app/app.jar"

# 1) CodeDeploy가 내려준 jar를 서비스 실행 경로로 복사(교체)
echo "▶ Copy jar: ${SRC_JAR} -> ${RUN_JAR_PATH}"
cp -f "${SRC_JAR}" "${RUN_JAR_PATH}"

# 2) 권한 설정 (설정에 맞게 변경)
# 서비스 실행 유저가 읽을 수 있도록 소유권을 맞춤
chown ubuntu:ubuntu "${RUN_JAR_PATH}"

# 3) systemd 서비스 재시작 (새 jar로 기동)
echo "▶ Restart systemd service: ${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

# 4) 서비스가 정상 기동(active) 상태인지 확인
# active가 아니면 exit code가 non-zero라서 스크립트 실패 처리됨
echo "▶ Check service active"
systemctl is-active --quiet "${SERVICE_NAME}"
