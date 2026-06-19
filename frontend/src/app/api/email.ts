const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 백엔드 메일 인프라 미구현 → API_BASE 미설정 시 mock 모드로 동작.
// 백엔드 준비 후 VITE_API_BASE_URL 채우면 자동으로 실 API 호출로 전환.
const USE_MOCK = !API_BASE;

/** 인증코드 유효시간(초). step2 카운트다운과 공유. */
export const CODE_TTL_SEC = 180;

/** mock 모드에서 통과되는 테스트 코드 (UI 안내 박스와 동일). */
export const MOCK_CODE = '123456';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SendCodeResult {
  /** 코드 유효시간(초). 카운트다운 시작값. */
  expiresInSec: number;
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class EmailApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'EmailApiError';
  }
}

export class EmailNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'EmailNetworkError';
  }
}

// ── Internals ──────────────────────────────────────────────────────────────────

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new EmailNetworkError(e, url);
  }
}

/** 응답을 읽고, 실패 시 envelope/bare 양쪽에서 code·message를 뽑아 EmailApiError로 던짐. */
async function ensureOk(res: Response): Promise<void> {
  if (res.ok) return;
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  const env = data as { error?: { code?: string; message?: string } } | Record<string, string> | null;
  const err = (env && 'error' in env ? env.error : env) as { code?: string; message?: string } | null;
  throw new EmailApiError(
    res.status,
    err?.code ?? 'UNKNOWN',
    err?.message ?? `HTTP ${res.status}`,
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Public API functions ───────────────────────────────────────────────────────

/**
 * POST /api/email/send — 회원가입 이메일 인증코드 발송.
 * 성공 시 코드 유효시간(초)을 반환 → 호출부에서 카운트다운 시작.
 */
export async function sendEmailCode(mail: string): Promise<SendCodeResult> {
  if (USE_MOCK) {
    await delay(900); // 발송 지연 시뮬레이션 (로딩 표시 확인용)
    return { expiresInSec: CODE_TTL_SEC };
  }

  const res = await safeFetch(`${API_BASE}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail }),
  });
  await ensureOk(res);
  return { expiresInSec: CODE_TTL_SEC };
}

/**
 * POST /api/email/verify — 인증코드 검증.
 * 코드 불일치/만료 시 EmailApiError를 던짐.
 */
export async function verifyEmailCode(mail: string, verifyCode: string): Promise<void> {
  if (USE_MOCK) {
    await delay(500);
    if (verifyCode !== MOCK_CODE) {
      throw new EmailApiError(400, 'INVALID_CODE', '인증 코드가 올바르지 않습니다. 다시 확인해주세요');
    }
    return;
  }

  const res = await safeFetch(`${API_BASE}/api/email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, verifyCode }),
  });
  await ensureOk(res);
}
