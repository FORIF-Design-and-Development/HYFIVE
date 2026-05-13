# CI/CD 설정 가이드 — Firebase Hosting + GitHub Actions

## 개요

| 워크플로우 | 파일 | 트리거 | 채널 / URL |
|---|---|---|---|
| CI (검증) | `.github/workflows/frontend-ci.yml` | PR → main, `frontend/**` 변경 시 | — |
| CD 운영 배포 | `.github/workflows/frontend-cd.yml` | push to **main** | `live` → `https://hyfive-forif.web.app` |
| CD 스테이징 배포 | 동일 파일 | push to **dev** | `dev` 채널 → `https://hyfive-forif--dev-XXXXXXXX.web.app` (30일 만료, 머지마다 리셋) |

CD는 아래 Firebase 설정이 완료되어야 동작합니다.

### 배포 흐름 요약

```
feat/* 브랜치 작업
   │
   └─ PR → dev 머지     →  스테이징 채널 자동 배포 (모바일·외부 테스트용)
            │
            └─ PR → main 머지  →  운영 사이트 갱신
```

> **첫 dev 배포 후 발급되는 URL은 GitHub Actions 로그의 "Deploy" 스텝 출력에 표시됩니다.**
> URL을 받아 Kakao Developers 콘솔의 플랫폼 도메인에 추가해야 지도가 동작합니다.

---

## 1단계: Firebase 프로젝트 생성

```bash
# (이미 완료됨 — 2026-05-07 세팅)
# Firebase 프로젝트: hyfive-forif
# Hosting URL: https://hyfive-forif.web.app
# Firebase Console: https://console.firebase.google.com/project/hyfive-forif/overview
```

---

## 2단계: .firebaserc 확인

`.firebaserc`가 이미 실제 프로젝트 ID로 설정되어 있습니다:

```json
{
  "projects": {
    "default": "hyfive-forif"
  }
}
```

---

## 3단계: GitHub Actions용 Service Account 키 (이미 생성됨)

Service Account `github-actions-deploy@hyfive-forif.iam.gserviceaccount.com`이 이미 생성되어 있습니다.

키 파일 위치: `C:\Users\ABC\Downloads\hyfive-github-actions-key.json`

키를 분실한 경우:
```bash
gcloud iam service-accounts keys create hyfive-github-actions-key.json \
  --iam-account="github-actions-deploy@hyfive-forif.iam.gserviceaccount.com" \
  --project=hyfive-forif
```

---

## 4단계: GitHub Secrets / Variables 등록 (수동 필요)

**https://github.com/FORIF-Design-and-Development/HYFIVE/settings/secrets/actions** 에서 직접 등록.

GitHub 레포 → **Settings → Secrets and variables → Actions**

### Secrets (암호화, 로그에 노출 안 됨)

| 이름 | 값 | 필수 여부 |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | 3단계에서 복사한 JSON 전체 | 필수 |
| `VITE_API_BASE_URL` | 백엔드 서버 URL (예: `https://api.hyfive.app`) | 백엔드 연동 후 등록 |

### Variables (평문, 로그에 노출 가능)

| 이름 | 값 | 필수 여부 |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID (예: `hyfive-app`) | 필수 |

---

## 5단계: Hosting 활성화

Firebase Console → **Hosting** → 시작하기 클릭 (약관 동의)

로컬에서 확인하려면:
```bash
# 루트 디렉토리에서
firebase hosting:channel:open live
```

---

## 첫 배포 확인

모든 설정이 완료된 후 `feat/figma-make-migration` 브랜치를 main에 머지하면:

1. `frontend-ci.yml`이 PR 단계에서 typecheck + lint + build 검증
2. 머지 완료 후 `frontend-cd.yml`이 자동 실행
3. `frontend/dist`가 Firebase Hosting에 배포됨
4. 배포 URL: **https://hyfive-forif.web.app**

---

## 배포 후 백엔드 연결

백엔드 URL이 확정되면 `firebase.json`에 rewrite 규칙을 추가합니다:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "destination": "https://your-backend-url.com/api/**"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

그리고 GitHub Variables에서 `VITE_API_BASE_URL`을 실제 URL로 업데이트합니다.

---

## 트러블슈팅

### CD 워크플로우가 실행 안 될 때

- `FIREBASE_SERVICE_ACCOUNT` 시크릿 등록 여부 확인
- `FIREBASE_PROJECT_ID` variable 등록 여부 확인
- `.firebaserc`의 프로젝트 ID가 실제 Firebase 프로젝트 ID와 일치하는지 확인
- Firebase Console에서 Hosting이 활성화되어 있는지 확인

### CI에서 lint 에러가 날 때

로컬에서 먼저 확인:
```bash
cd frontend
npm run lint
npm run typecheck
```
