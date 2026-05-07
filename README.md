# HYFIVE
AI 반려동물 건강 통합 관리 앱 — FORIF 26-1 기획개발 2팀

## 개발 시작

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

환경변수: `frontend/.env.example` 참고
- `VITE_USE_MOBILE_FRAME=true` — 데스크톱 브라우저에서 iPhone 목 프레임 표시
- `VITE_USE_MOBILE_FRAME=false` — react-native-webview 배포 시 풀스크린 모드

### Backend

```bash
cd backend
./gradlew bootRun
```

## CI/CD

| 워크플로우 | 트리거 | 역할 |
|---|---|---|
| `frontend-ci.yml` | PR → main (`frontend/**` 변경 시) | typecheck + lint + build 검증 |
| `frontend-cd.yml` | push to main (`frontend/**` 변경 시) | Firebase Hosting 자동 배포 |



## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, react-router v7 |
| Backend | Spring Boot (Java) |
| 배포 | Firebase Hosting (GitHub Actions 자동 배포) |
| 모바일 배포 | react-native-webview (별도 plan, 후속 작업) |

## 라이선스
shadcn/ui components: MIT License
Unsplash photos: Unsplash License
