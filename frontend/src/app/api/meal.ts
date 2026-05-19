const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

export interface MealApiItem {
  time: string;
  type: string;
  amount: string;
  is_left: string;
  memo: string;
}

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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new MealNetworkError(e, url);
  }
}

/** 식사 기록 여부 확인 (오늘) — GET /api/check/meal */
export async function checkTodayMeals(): Promise<MealApiItem[]> {
  const res = await safeFetch(`${API_BASE}/api/check/meal`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new MealApiError(res.status, `HTTP ${res.status}`);
  const body = await res.json() as MealApiItem[] | { list: MealApiItem[] };
  return Array.isArray(body) ? body : (body.list ?? []);
}

/** 날짜별 기록 조회 — GET /api/record/meal?date=YYYY-MM-DD */
export async function getMealsByDate(date: string): Promise<MealApiItem[]> {
  const res = await safeFetch(`${API_BASE}/api/record/meal?date=${date}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  if (res.status === 400) throw new MealApiError(400, '조회할 수 없는 날짜예요.');
  if (!res.ok) throw new MealApiError(res.status, `HTTP ${res.status}`);
  const body = await res.json() as { list: MealApiItem[] };
  return body.list ?? [];
}

/** 식사 기록 저장 — POST /api/upload/meal
 *  returns true: 신규 저장, false: 이미 존재 (409, 수정 완료로 처리) */
export async function uploadMeal(body: MealApiItem): Promise<boolean> {
  const res = await safeFetch(`${API_BASE}/api/upload/meal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.ok) return true;
  if (res.status === 409) return false;
  throw new MealApiError(res.status, `HTTP ${res.status}`);
}
