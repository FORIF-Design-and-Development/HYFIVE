const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

export interface Walk {
  walkId: number;
  petId: number;
  startAt: string;
  endedAt: string;
  distanceKm: number;
  calories: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateWalkBody {
  petId: number;
  startAt: string;
  endedAt: string;
  distanceKm?: number;
  calories?: number;
}

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta: unknown;
}

export class WalkApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'WalkApiError';
  }
}

export class WalkNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'WalkNetworkError';
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
    // fetch() rejects with TypeError on network failure (no DNS, refused, CORS preflight)
    throw new WalkNetworkError(e, url);
  }
}

async function parse<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (e.g., HTML error page from a reverse proxy)
    throw new WalkApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON response)`);
  }
  if (!res.ok || body.error) {
    throw new WalkApiError(
      res.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  if (body.data === null) {
    throw new WalkApiError(res.status, 'EMPTY_RESPONSE', 'Empty response');
  }
  return body.data;
}

export async function createWalk(body: CreateWalkBody): Promise<Walk> {
  const res = await safeFetch(`${API_BASE}/api/walks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parse<Walk>(res);
}

export async function listWalks(petId: number): Promise<Walk[]> {
  const res = await safeFetch(`${API_BASE}/api/walks?petId=${petId}`, {
    headers: authHeaders(),
  });
  return parse<Walk[]>(res);
}
