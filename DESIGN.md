# DESIGN.md — HYFIVE 디자인 시스템 토큰

> **Single Source of Truth** for all design tokens.
> UI 코드 작성 전 반드시 이 파일을 먼저 읽고, 여기 정의된 토큰만 사용하세요.
>
> **1차 이식 단계 한시적 허용**: 디자인 초안(Figma Make)을 그대로 이식한 컴포넌트에는
> 인라인 hex/px 값이 남아있습니다. 후속 PR에서 아래 토큰으로 단계적으로 치환합니다.

---

## 브랜드 컬러 (Brand Colors)

| 토큰 이름 | 값 | 용도 |
|---|---|---|
| `brand-primary` | `#1B4B8C` | 주요 액션, 아이콘 활성, 버튼 텍스트 |
| `brand-deep` | `#0D2B5E` | 스플래시 그라데이션 시작 |
| `brand-mid` | `#2E6DB4` | 스플래시 그라데이션 중간 |
| `brand-sky` | `#6A9FD4` | 스플래시 그라데이션 끝, 하이라이트 |
| `brand-active-tint` | `#E8F0FA` | 네비게이션 활성 배경 원 |

## 배경/표면 (Background / Surface)

| 토큰 이름 | 값 | 용도 |
|---|---|---|
| `page-bg` | `#EEF2F8` | 데스크톱 미리보기 배경 (MobileFrame 외곽) |
| `canvas-bg` | `#F5F5F5` | 앱 캔버스 기본 배경 |
| `surface-white` | `#FFFFFF` | 카드, 바텀 네비, 입력 배경 |
| `frame-dark` | `#1C1C1C` | iPhone 목 프레임 색상 |
| `inactive` | `#BDBDBD` | 비활성 아이콘/텍스트 |
| `divider` | `#EBEBEB` | 구분선 |

## CSS 변수 테마 (from `src/styles/theme.css`)

```css
--background: #ffffff;
--foreground: oklch(0.145 0 0);
--card: #ffffff;
--primary: #030213;
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.95 0.0058 264.53);
--secondary-foreground: #030213;
--muted: #ececf0;
--muted-foreground: #717182;
--accent: #e9ebef;
--accent-foreground: #030213;
--destructive: #d4183d;
--destructive-foreground: #ffffff;
--border: rgba(0, 0, 0, 0.1);
--input-background: #f3f3f5;
--radius: 0.625rem;
```

차트 컬러:

```css
--chart-1: oklch(0.646 0.222 41.116);   /* 주황 */
--chart-2: oklch(0.6 0.118 184.704);    /* 청록 */
--chart-3: oklch(0.398 0.07 227.392);   /* 진청 */
--chart-4: oklch(0.828 0.189 84.429);   /* 연황 */
--chart-5: oklch(0.769 0.188 70.08);    /* 황금 */
```

---

## 폰트 (Typography)

| 토큰 이름 | 패밀리 | 용도 |
|---|---|---|
| `font-default` | `HanaFont` | 전체 기본 (하나서체) |
| `font-kr-fallback` | `Noto Sans KR` | 한국어 폴백 |
| `font-logo` | `Nunito` | HYFIVE 앱 로고 타이틀 |
| `font-accent` | `LotteriaChab` | 액센트 텍스트 |
| `font-system` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 시스템 폴백 |

폰트 소스: `src/styles/fonts.css` (CDN 로드, `font-display: swap`)

---

## 간격 / 레이아웃 (Spacing / Layout)

모바일 캔버스 규격 (iPhone 15 Pro 기준):

| 토큰 이름 | 값 | 용도 |
|---|---|---|
| `canvas-width` | `393px` | 앱 캔버스 너비 |
| `canvas-height` | `852px` | 앱 캔버스 높이 |
| `status-bar-height` | `56px` | 상단 상태바 영역 |
| `bottom-nav-height` | `56px` | 하단 네비게이션 바 |
| `dynamic-island-width` | `126px` | 다이나믹 아일랜드 너비 |
| `dynamic-island-height` | `34px` | 다이나믹 아일랜드 높이 |

---

## 라디우스 (Border Radius)

| 토큰 이름 | 값 |
|---|---|
| `--radius` | `0.625rem` (10px) |
| `--radius-sm` | `calc(var(--radius) - 4px)` = 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` = 8px |
| `--radius-lg` | `var(--radius)` = 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` = 14px |
| `rounded-2xl` | `16px` (버튼, 카드에서 자주 사용) |

---

## 컴포넌트 패턴 (Component Primitives)

### BottomNav
- 높이: 56px (paddings 포함)
- 아이콘 크기: 20px (lucide-react)
- 활성 컬러: `brand-primary` (#1B4B8C)
- 비활성 컬러: `inactive` (#BDBDBD)
- 활성 배경: `brand-active-tint` (#E8F0FA), 32×32 원형

### 버튼 (Primary)
- 높이: 54px, `rounded-2xl`
- 배경: `brand-primary` 또는 `white` (반전)
- 폰트: `font-weight: 700`, `font-size: 16px`
- 그림자: `0 8px 32px rgba(0,0,0,0.2)` (스플래시)

### 카드
- 배경: `white`
- 보더: `rgba(0,0,0,0.1)` 또는 없음
- 라디우스: `rounded-2xl` (16px)

---

## 접근성 (Accessibility)

- WCAG AA 대비비 미달 토큰 조합 사용 금지
- `brand-primary` (#1B4B8C) on `white` (#FFF): 대비비 ≈ 9.6:1 ✓
- `inactive` (#BDBDBD) on `white` (#FFF): 대비비 ≈ 1.6:1 — 아이콘 전용, 텍스트 단독 사용 금지

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-07 | Figma Make zip 1차 이식 — theme.css + 브랜드 컬러 시드. 컴포넌트 인라인 hex 한시적 허용 |
