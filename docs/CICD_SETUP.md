# CI/CD 설정 가이드 — Firebase Hosting + GitHub Actions

## 개요

| 워크플로우 | 파일 | 트리거 |
|---|---|---|
| CI (검증) | `.github/workflows/frontend-ci.yml` | PR → main, `frontend/**` 변경 시 |
| CD (배포) | `.github/workflows/frontend-cd.yml` | push to main, `frontend/**` 변경 시 |

CD는 아래 Firebase 설정이 완료되어야 동작합니다.

---

## 1단계: Firebase 프로젝트 생성

```bash
# firebase-tools가 없으면 설치
npm install -g firebase-tools

# Google 계정으로 로그인
firebase login

# 프로젝트 생성 (이름은 전 세계 고유해야 함)
firebase projects:create hyfive-app --display-name "HYFIVE"
```

또는 [Firebase Console](https://console.firebase.google.com/)에서 직접 생성.

---

## 2단계: .firebaserc 업데이트

`.firebaserc` 파일의 `YOUR_FIREBASE_PROJECT_ID`를 실제 프로젝트 ID로 교체합니다.

```json
{
  "projects": {
    "default": "hyfive-app"
  }
}
```

프로젝트 ID 확인: Firebase Console → 프로젝트 설정 → 일반 탭 → 프로젝트 ID

---

## 3단계: GitHub Actions용 Service Account 생성

1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트 선택
2. 좌측 하단 **프로젝트 설정** (톱니바퀴) 클릭
3. **서비스 계정** 탭 → **새 비공개 키 생성**
4. 다운로드된 JSON 파일 내용 전체를 복사 (파일 삭제 후 분실하지 않도록 주의)

---

## 4단계: GitHub Secrets / Variables 등록

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
4. 배포 URL: `https://YOUR_FIREBASE_PROJECT_ID.web.app`

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
