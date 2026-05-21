const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';
const PET_ID_KEY = 'hyfive_petId';

// ── Types ──────────────────────────────────────────────────────────────────────

/** API에서 오는 식사 항목 (enum 값 그대로) */
export interface MealApiItem {
  time: string;    // MORNING | LUNCH | DINNER
  type: string;    // DRY | WET | MIX
  amount: string;
  is_left: string; // NONE | FEW | HALF
  memo: string;
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class MealApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MealApiError';
  }
}

export class MealNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'MealNetworkError';
  }
}

// ── Internals ──────────────────────────────────────────────────────────────────

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta: unknown;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getPetId(): string {
  return localStorage.getItem(PET_ID_KEY) ?? '1';
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new MealNetworkError(e, url);
  }
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new MealApiError(res.status, `HTTP ${res.status} (non-JSON body)`);
  }
  if (!res.ok || body.error) {
    throw new MealApiError(
      res.status,
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  // data가 null이면 빈 배열로 처리 (리스트 엔드포인트)
  if (body.data === null || body.data === undefined) {
    return [] as unknown as T;
  }
  return body.data;
}

// ── Public API functions ───────────────────────────────────────────────────────

/** 식사 기록 여부 확인 (오늘) — GET /api/check/meal?petId= */
export async function checkTodayMeals(): Promise<MealApiItem[]> {
  const petId = getPetId();
  const res = await safeFetch(`${API_BASE}/api/check/meal?petId=${petId}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new MealApiError(res.status, `HTTP ${res.status}`);
  return parseEnvelope<MealApiItem[]>(res);
}

/** 날짜별 기록 조회 — GET /api/record/meal?date=YYYY-MM-DD */
export async function getMealsByDate(date: string): Promise<MealApiItem[]> {
  const res = await safeFetch(`${API_BASE}/api/record/meal?date=${date}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  if (res.status === 400) throw new MealApiError(400, '조회할 수 없는 날짜예요.');
  if (!res.ok) throw new MealApiError(res.status, `HTTP ${res.status}`);
  return parseEnvelope<MealApiItem[]>(res);
}

/** 식사 기록 저장 — POST /api/upload/meal
 *  returns true: 신규 저장, false: 이미 존재 (409, 수정 완료로 처리) */
export async function uploadMeal(item: MealApiItem): Promise<boolean> {
  const petId = getPetId();
  const res = await safeFetch(`${API_BASE}/api/upload/meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...item, petId }),
  });
  if (res.ok) return true;
  if (res.status === 409) return false;
  throw new MealApiError(res.status, `HTTP ${res.status}`);
}
