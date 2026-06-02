const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

// ── Types ──────────────────────────────────────────────────────────────────────

export type VaccinationCode =
  | 'DHPPL'
  | 'RABIES'
  | 'KENNEL_COUGH'
  | 'CORONA_ENTERITIS'
  | 'HEARTWORM'
  | 'PARASITE';

export type AlertType =
  | 'HEARTWORM_DUE_THIS_MONTH'
  | 'DHPPL_DUE_THIS_MONTH'
  | 'RABIES_DUE_THIS_MONTH'
  | 'KENNEL_COUGH_DUE_THIS_MONTH'
  | 'CORONA_ENTERITIS_DUE_THIS_MONTH'
  | 'PARASITE_DUE_THIS_MONTH'
  | 'WALK_RECORD_MISSING';

export interface ReportPet {
  petId: number;
  name: string;
  breed: string;
  ageYears: number | null;
  profileImageUrl: string | null;
}

export interface ReportMonthlyVisit {
  month: string; // "YYYY-MM"
  count: number;
}

export interface ReportMedical {
  totalVisitCount: number;
  monthlyVisits: ReportMonthlyVisit[];
}

export interface ReportWalkTrend {
  weekStart: string; // "YYYY-MM-DD" (월요일)
  minutes: number;
}

export interface ReportLifestyle {
  weeklyAverageWalkMinutes: number;
  walkTrend: ReportWalkTrend[];
  latestWeightKg: number | null;
  weightChangeKg: number | null;
}

export interface ReportVaccination {
  code: VaccinationCode;
  lastVaccinationDate: string; // "YYYY-MM-DD"
}

export interface ReportAlert {
  type: AlertType | string;
  message: string;
  detail: string;
  actionPath: string;
}

export interface Report {
  pet: ReportPet;
  medical: ReportMedical;
  lifestyle: ReportLifestyle;
  vaccinations: ReportVaccination[];
  alerts: ReportAlert[];
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class ReportApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReportApiError';
  }
}

export class ReportNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'ReportNetworkError';
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
    throw new ReportNetworkError(e, url);
  }
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ReportApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }
  if (!res.ok || body.error) {
    throw new ReportApiError(
      res.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  if (body.data === null) {
    throw new ReportApiError(res.status, 'EMPTY_RESPONSE', 'Empty response');
  }
  return body.data;
}

// ── Public API functions ───────────────────────────────────────────────────────

export async function getReport(petId: number): Promise<Report> {
  const res = await safeFetch(`${API_BASE}/api/report?petId=${petId}`, {
    headers: authHeaders(),
  });
  return parseEnvelope<Report>(res);
}
