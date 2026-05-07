# Plan: migrate-figma-make

## 개요
Figma Make zip(React 18 + TS + Vite 6 + Tailwind v4 + shadcn/ui)을 기존 `frontend/` 폴더로 이식하고,
향후 `react-native-webview`로 감쌀 수 있도록 모바일 프레임/뷰포트/라우팅을 정리합니다.
이번 작업 범위는 웹앱(React+TS) 한정이며, RN 셸은 후속 plan으로 분리합니다.

## 브랜치
`feat/figma-make-migration`

## 작업 항목
1. feat/figma-make-migration 브랜치 생성
2. frontend/ 기존 JS 스켈레톤 삭제, React 18 + TS 코드로 교체
3. zip의 src/app, src/styles, src/assets, src/main.tsx, vite.config.ts, postcss.config.mjs, index.html 이식
4. package.json 재구성 (미사용 의존성 10개 제거, TS 도구체인 추가)
5. tsconfig.json, tsconfig.node.json, eslint.config.js, vite-env.d.ts 추가
6. MobileFrame.tsx/SplashScreen.tsx에 VITE_USE_MOBILE_FRAME env 토글 추가
7. DESIGN.md 시드 (theme.css 토큰 + 브랜드 컬러 + 폰트 + 캔버스 규격)
8. 루트 README.md 업데이트
9. npm install + typecheck + build + dev 검증

## 범위 외 (별도 plan)
- React Native(Expo) 셸 + WebView 통합
- 인라인 hex/px → 토큰 전면 치환
- backend API 연동
- 라우팅 가드 로직
