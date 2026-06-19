const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

// ── Types ──────────────────────────────────────────────────────────────────────

export type BowelStatus = 'NORMAL' | 'SOFT' | 'HARD' | 'BLOOD' | 'NONE';

export interface HealthMedication {
  name: string;
  isTaken: boolean;
}

/** 3-1 / 3-3 / 3-4 응답 (medications + symptoms 포함) */
export interface HealthRecord {
  healthRecordId: number;
  petId: number;
  weight: number;
  bowelStatus: BowelStatus;
  medications: HealthMedication[];
  symptoms: string[];
  createdAt: string;
  updatedAt: string | null;
}

/** 3-2 목록 응답 (medications / symptoms 미포함) */
export interface HealthRecordSummary {
  healthRecordId: number;
  petId: number;
  weight: number;
  bowelStatus: BowelStatus;
  recentWeights: { weight: number; createdAt: string }[];
  createdAt: string;
  updatedAt: string | null;
}

export interface HealthRecordBody {
  petId: number;
  weight: number;
  bowelStatus: BowelStatus;
  medications?: HealthMedication[];
  symptoms?: string[];
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class HealthApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HealthApiError';
  }
}

export class HealthNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'HealthNetworkError';
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

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new HealthNetworkError(e, url);
  }
}

async function parse<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new HealthApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }
  if (!res.ok || body.error) {
    throw new HealthApiError(
      res.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  if (body.data === null) {
    throw new HealthApiError(res.status, 'EMPTY_RESPONSE', 'Empty response');
  }
  return body.data;
}

// ── Public API functions ───────────────────────────────────────────────────────

/** 3-1. 건강기록 등록 */
export async function createHealthRecord(body: HealthRecordBody): Promise<HealthRecord> {
  const res = await safeFetch(`${API_BASE}/api/health-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parse<HealthRecord>(res);
}

/** 3-2. 건강기록 목록 조회 (petId 기준, 캘린더 dot + 날짜→ID 매핑용) */
export async function listHealthRecords(petId: number): Promise<HealthRecordSummary[]> {
  const res = await safeFetch(`${API_BASE}/api/health-records?petId=${petId}`, {
    headers: authHeaders(),
  });
  return parse<HealthRecordSummary[]>(res);
}

/** 3-3. 건강기록 단건 조회 */
export async function getHealthRecord(healthRecordId: number): Promise<HealthRecord> {
  const res = await safeFetch(`${API_BASE}/api/health-records/${healthRecordId}`, {
    headers: authHeaders(),
  });
  return parse<HealthRecord>(res);
}

/** 3-4. 건강기록 수정 */
export async function updateHealthRecord(
  healthRecordId: number,
  body: HealthRecordBody,
): Promise<HealthRecord> {
  const res = await safeFetch(`${API_BASE}/api/health-records/${healthRecordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parse<HealthRecord>(res);
}
