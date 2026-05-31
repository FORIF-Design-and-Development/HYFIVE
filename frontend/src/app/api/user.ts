const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  email: string;
  name: string;
  nickname: string;
  createdAt: string;
}

// name은 필수, nickname은 선택
export interface UpdateUserBody {
  name: string;
  nickname?: string;
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class UserApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'UserApiError';
  }
}

export class UserNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'UserNetworkError';
  }
}

// ── Internals ──────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new UserNetworkError(e, url);
  }
}

async function parseProfile(res: Response): Promise<UserProfile> {
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new UserApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }

  if (!res.ok) {
    const err = data as Record<string, string> | null;
    throw new UserApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? `HTTP ${res.status}`,
    );
  }

  // 명세상 envelope 없이 직접 반환. 단 { data: ... } envelope도 허용.
  const env = data as { data?: UserProfile } | null;
  return (env && 'data' in env && env.data ? env.data : data) as UserProfile;
}

// ── Public API functions ───────────────────────────────────────────────────────

/** GET /api/v1/users/me — 현재 로그인한 유저 개인정보 조회 */
export async function getMe(): Promise<UserProfile> {
  const res = await safeFetch(`${API_BASE}/api/v1/users/me`, {
    method: 'GET',
    headers: { ...authHeaders() },
  });
  return parseProfile(res);
}

/** PATCH /api/v1/users/me — 이름·닉네임 수정 (name 필수, nickname 선택) */
export async function updateMe(body: UpdateUserBody): Promise<UserProfile> {
  const res = await safeFetch(`${API_BASE}/api/v1/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parseProfile(res);
}
