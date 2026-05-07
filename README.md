# HYFIVE

AI 반려동물 건강 통합 관리 앱 — FORIF 26-1 기획개발 2팀

## 프로젝트 구조

```
HYFIVE/
├── frontend/          # React 18 + TypeScript + Vite 6 + Tailwind v4 + shadcn/ui
│                      # 웹앱 SPA (Figma Make 디자인 초안 기반)
│                      # → 향후 react-native-webview 셸로 모바일 배포 예정
│
├── backend/           # Spring Boot 백엔드 API
│
├── DESIGN.md          # 디자인 토큰 SSOT (컬러, 폰트, 간격, 컴포넌트 패턴)
└── docs/              # PRD, API 명세, 아키텍처, 플랜
```

## 개발 시작

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # 프로덕션 빌드
npm run typecheck  # TypeScript 검사
npm run lint       # ESLint
```

환경변수: `frontend/.env.example` 참고

- `VITE_USE_MOBILE_FRAME=true` — 데스크톱 브라우저에서 iPhone 목 프레임 표시
- `VITE_USE_MOBILE_FRAME=false` — react-native-webview 배포 시 풀스크린 모드

### Backend

```bash
cd backend
./gradlew bootRun
```

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, react-router v7 |
| Backend | Spring Boot (Java) |
| 모바일 배포 | react-native-webview (별도 plan, 후속 작업) |

## 라이선스

shadcn/ui components: MIT License
Unsplash photos: Unsplash License
