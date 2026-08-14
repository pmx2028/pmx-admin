# CI/CD 구성 문서 (total-cms)

본 문서는 total-cms 프로젝트의 CI/CD 및 배포 구조를 설명한다.

- DEV: 단일 인스턴스 배포
- PROD: Blue-Green(무중단) 배포
---

## 1. 전체 디렉토리 구조

```text
.
├─ appspec-dev.yml 
├─ appspec-prod.yml
│
├─ ops/                       # 공유/문서용 운영 자산
│   └─ systemd/
│       ├─ total-cms-dev.service
│       ├─ total-cms-prod1.service
│       └─ total-cms-prod2.service
│
├─ scripts/
│   ├─ dev/
│   │   ├─ dev_deploy.sh
│   │   └─ dev_healthcheck.sh
│   └─ prod/
│       ├─ prod_choose_slot.sh
│       ├─ prod_deploy.sh
│       └─ prod_healthcheck.sh
│
└─ .github/workflows/
    ├─ dev-workflow.yml
    └─ prod-workflow.yml
```
### 디렉토리 역할 요약
| 경로                   | 역할                         |
| -------------------- | -------------------------- |
| `appspec-*.yml`      | CodeDeploy 진입점 (루트 유지)     |
| `ops/`               | systemd 등 **공유/문서용 운영 자산** |
| `scripts/`           | 실제 배포 시 실행되는 스크립트          |
| `.github/workflows/` | GitHub Actions CI/CD       |
---

## 2. 배포 흐름 요약

### DEV 배포 흐름

```text
GitHub (dev 브랜치 push)
 → GitHub Actions (deploy-dev.yml)
   → Build
   → 배포 번들 생성 (임시 디렉토리)
   → S3 업로드
     → CodeDeploy
       → dev_deploy.sh
       → systemd 재시작
       → dev_healthcheck.sh
       → 실패 시 자동 롤백

```

### PROD 배포 흐름 (Blue-Green)

```text
GitHub (main 브랜치 push)
 → GitHub Actions (deploy-prod.yml)
   → Build
   → 배포 번들 생성 (임시 디렉토리)
   → S3 업로드
     → CodeDeploy
       → prod_choose_slot.sh (idle 슬롯 선택)
       → prod_deploy.sh
           - idle 슬롯 기동
           - healthcheck
           - nginx upstream 전환
           - 기존 슬롯 종료
       → prod_healthcheck.sh
       → 실패 시 자동 롤백
```

---

## 3. GitHub Actions 워크플로우

### 3.1 DEV (dev-workflow.yml)
- 트리거: dev 브랜치 push
- 역할
  - Gradle 빌드
  - DEV용 스크립트만 포함
  - appspec-dev.yml을 appspec.yml로 복사
  - S3 업로드

### 3.2 PROD (deploy-prod.yml)
- 트리거: main 브랜치 push
- 역할
  - Gradle 빌드
  - PROD용 스크립트만 포함
  - appspec-prod.yml을 appspec.yml로 복사
  - S3 업로드

---

## 4. CodeDeploy AppSpec

### 4.1 DEV (`appspec-dev.yml`)
- 주요 Hook
  - ApplicationStart → dev_deploy.sh
  - ValidateService → dev_healthcheck.sh
- 헬스체크 실패 시
  - exit 1
  - CodeDeploy DEPLOYMENT_FAILURE
  - 직전 성공 리비전으로 자동 롤백

### 4.2 PROD (`appspec-prod.yml`)
- 주요 Hook
  - BeforeInstall → idle 슬롯 결정
  - ApplicationStart → 무중단 배포 수행
  - ValidateService → 최종 검증
- 헬스체크 실패 시
  - nginx 전환 없음
  - 배포 실패 처리
  - CodeDeploy 자동 롤백

---

## 5. systemd 서비스 구성

### 5.1 DEV
- 서비스명: total-cms-dev
- 프로파일: dev
- 포트: application-dev.yml에서 관리
- 단일 인스턴스

### 5.2 PROD (Blue-Green)
- 서비스명
  - total-cms-prod1
  - total-cms-prod2
- 프로파일: prod
- 포트는 systemd에서만 분기 (application-prod.yml에는 server.port를 정의하지 않음)
  
  | 서비스 | 포트   |
  |-----|------|
  | prod1 | 3022 |
  | prod2 | 3023 |

---

## 6. application 설정 전략
### DEV

```yaml
# application-dev.yml
server:
  port: 3022
  compression:
    enabled: true
```

### PROD
````yaml
# application-prod.yml
server:
    compression:
      enabled: true
````
- PROD의 포트는 systemd 책임
- 설정 중복 및 포트 충돌 방지

---

## 7. SSM Parameter Store 연동
- Spring Boot 시작 시 SSM에서 설정 로드
- EC2 Instance Profile(Role) 기반 접근
- SSM 값 변경 시 서비스 재시작 필요
- CodeDeploy 재배포 = 재시작 효과

---

## 8. 롤백 전략
- DEV / PROD 공통
  - ValidateService 실패 시
    - exit 1
    - CodeDeploy DEPLOYMENT_FAILURE
    - 자동 롤백 수행
- 서버 단에서 jar를 직접 되돌리지 않음
- 롤백 책임은 CodeDeploy에 위임

---

