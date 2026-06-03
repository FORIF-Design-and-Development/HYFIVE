const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'hyfive_token';
const PET_ID_KEY = 'hyfive_petId';

// ── Types ──────────────────────────────────────────────────────────────────────

export type PetType = 'DOG' | 'CAT';
export type DogSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type PetGender = 'MALE' | 'FEMALE';

export interface PetProfileResponse {
  petId: number;
  name: string;
  type: PetType;
  dogSize: DogSize | null;
  breed: string | null;
  birthdate: string | null;
  ageYears: number | null;
  weightKg: number | null;
  gender: PetGender;
  isNeutered: boolean;
  profileImageUrl: string | null;
  isActive: boolean;
}

export interface UpdatePetBody {
  profileImageUrl?: string;
  isNeutered?: boolean;
  weightKg?: number;
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

// 에러 응답 envelope (GlobalExceptionHandler가 반환하는 형태)
interface ApiErrorEnvelope {
  data: null;
  error: { code: string | number; message: string } | null;
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
    throw new PetNetworkError(e, url);
  }
}

// PetController는 성공 시 데이터를 직접 반환(envelope 미사용),
// 실패 시 GlobalExceptionHandler가 { data, error, meta } envelope로 반환
async function parse<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new PetApiError(res.status, 'BAD_RESPONSE', `HTTP ${res.status} (non-JSON body)`);
  }
  if (!res.ok) {
    const env = body as ApiErrorEnvelope | null;
    throw new PetApiError(
      res.status,
      String(env?.error?.code ?? 'UNKNOWN'),
      env?.error?.message ?? `HTTP ${res.status}`,
    );
  }
  return body as T;
}

// ── Display helpers ────────────────────────────────────────────────────────────

export function petEmoji(type: PetType): string {
  return type === 'DOG' ? '🐶' : '🐱';
}

export function petTag(type: PetType, dogSize: DogSize | null): string {
  if (type === 'CAT') return '고양이';
  const map: Record<DogSize, string> = { SMALL: '소형견', MEDIUM: '중형견', LARGE: '대형견' };
  return dogSize ? map[dogSize] : '강아지';
}

export function petGenderText(gender: PetGender, isNeutered: boolean): string {
  return `${gender === 'MALE' ? '수컷' : '암컷'} · ${isNeutered ? '중성화 완료' : '중성화 미실시'}`;
}

// ── Public API functions ───────────────────────────────────────────────────────

/** GET /api/v1/pets/active — 현재 활성 반려동물 프로필 조회 */
export async function getActivePet(): Promise<PetProfileResponse> {
  const res = await safeFetch(`${API_BASE}/api/v1/pets/active`, {
    headers: authHeaders(),
  });
  return parse<PetProfileResponse>(res);
}

/** GET /api/v1/pets — 전체 프로필 목록 조회 */
export async function listPets(): Promise<PetProfileResponse[]> {
  const res = await safeFetch(`${API_BASE}/api/v1/pets`, {
    headers: authHeaders(),
  });
  return parse<PetProfileResponse[]>(res);
}

/** PATCH /api/v1/pets/{petId} — 반려동물 정보 수정 (프로필 사진·중성화·체중) */
export async function updatePet(petId: number, body: UpdatePetBody): Promise<PetProfileResponse> {
  const res = await safeFetch(`${API_BASE}/api/v1/pets/${petId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parse<PetProfileResponse>(res);
}

/** PATCH /api/v1/pets/{petId}/activate — 활성 프로필 전환 */
export async function activatePet(petId: number): Promise<PetProfileResponse> {
  const res = await safeFetch(`${API_BASE}/api/v1/pets/${petId}/activate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const pet = await parse<PetProfileResponse>(res);
  localStorage.setItem(PET_ID_KEY, String(petId));
  return pet;
}