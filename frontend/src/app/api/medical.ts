const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';
const PET_ID_KEY = 'hyfive_petId';

// ── Types ──────────────────────────────────────────────────────────────────────

export type MedicalTypeEnum = 'TREATMENT' | 'VACCINATION' | 'SURGERY' | 'CHECKUP' | 'OTHER';

export interface MedicalPrescription {
  prescriptionId: number;
  content: string;
  period: string;
}

export interface MedicalRecordApi {
  medicalRecordId: number;
  petId: number;
  type: MedicalTypeEnum;
  clinicName: string;
  visitDate: string;
  content: string;
  diagnosis: string;
  totalCost: number;
  prescriptions: MedicalPrescription[];
  imageUrls: string[];
  createdAt: string;
}

export interface MedicalOcrExtracted {
  type: MedicalTypeEnum;
  clinicName: string;
  visitDate: string;
  diagnosis: string;
  content: string;
  totalCost: string;
  prescriptions: string[];
}

export interface MedicalOcrResult {
  rawText: string;
  extracted: MedicalOcrExtracted;
  imageUrls: string[];
}

export interface MedicalUploadBody {
  type: MedicalTypeEnum;
  clinicName: string;
  visitDate: string;
  content: string;
  diagnosis: string;
  totalCost: string;
  image: string[];
}

export interface MedicalLatestDetail {
  content: string;
  created_at: string;
}

export interface MedicalLatestSummary {
  total_count: number;
  detail: MedicalLatestDetail[];
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class MedicalApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MedicalApiError';
  }
}

export class MedicalNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'MedicalNetworkError';
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
    throw new MedicalNetworkError(e, url);
  }
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new MedicalApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }
  if (!res.ok || body.error) {
    throw new MedicalApiError(
      res.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  if (body.data === null) {
    throw new MedicalApiError(res.status, 'EMPTY_RESPONSE', 'Empty response');
  }
  return body.data;
}

// ── Public API functions ───────────────────────────────────────────────────────

export async function getMedicalRecords(): Promise<MedicalRecordApi[]> {
  const petId = getPetId();
  const res = await safeFetch(`${API_BASE}/api/records/medical?petId=${petId}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  return parseEnvelope<MedicalRecordApi[]>(res);
}

export async function analyzeMedicalOcr(
  visitDate: string,
  type: MedicalTypeEnum,
  imageBase64List: string[],
): Promise<MedicalOcrResult> {
  const res = await safeFetch(`${API_BASE}/api/ocr/medical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ visitDate, type, image: imageBase64List }),
  });
  return parseEnvelope<MedicalOcrResult>(res);
}

export async function uploadMedicalRecord(body: MedicalUploadBody): Promise<MedicalRecordApi> {
  const petId = Number(getPetId());
  const res = await safeFetch(`${API_BASE}/api/upload/medical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...body, petId }),
  });
  return parseEnvelope<MedicalRecordApi>(res);
}

export async function getLatestMedicalSummary(): Promise<MedicalLatestSummary> {
  const res = await safeFetch(`${API_BASE}/api/records/medical/latest`, {
    headers: authHeaders(),
  });
  return parseEnvelope<MedicalLatestSummary>(res);
}
