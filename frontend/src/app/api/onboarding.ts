const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VaccinationInput {
  code: string;
  isCompleted: boolean;
}

export interface CreatePetBody {
  type: 'DOG' | 'CAT';
  name: string;
  breed: string;
  birthdate: string;
  gender: 'MALE' | 'FEMALE';
  isNeutered: boolean;
  weightKg: number;
  lastCheckupDate?: string;
  preExistingIllness?: string;
  profileImageUrl?: string;
  vaccinations?: VaccinationInput[];
}

// 응답은 공통 envelope 없이 CreatePetResponse 직접 반환
export interface CreatePetResponse {
  petId: number;
  type: string;
  name: string;
  breed: string;
  birthdate: string;
  gender: string;
  isNeutered: boolean;
  weightKg: number;
}

// ── Error classes ──────────────────────────────────────────────────────────────

export class PetApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PetApiError';
  }
}

export class PetNetworkError extends Error {
  constructor(
    public cause: unknown,
    public url: string,
  ) {
    super('Failed to reach the API server');
    this.name = 'PetNetworkError';
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
    throw new PetNetworkError(e, url);
  }
}

// ── Public API functions ───────────────────────────────────────────────────────

/** POST /api/v1/pets — 반려동물 등록 (응답이 envelope 없이 직접 반환됨) */
export async function createPet(body: CreatePetBody): Promise<CreatePetResponse> {
  const res = await safeFetch(`${API_BASE}/api/v1/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new PetApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }

  if (!res.ok) {
    const err = data as Record<string, string> | null;
    throw new PetApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? `HTTP ${res.status}`,
    );
  }

  return data as CreatePetResponse;
}

/** POST /images — S3에 이미지 업로드 후 URL 반환 */
export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await safeFetch(`${API_BASE}/images`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });

  if (!res.ok) {
    throw new PetApiError(
        res.status,
        'IMAGE_UPLOAD_FAILED',
        `이미지 업로드 실패 (HTTP ${res.status})`,
    );
  }

  return res.text();
}