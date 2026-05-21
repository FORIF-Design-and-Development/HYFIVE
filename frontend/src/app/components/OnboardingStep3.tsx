import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { CheckCircle2, Edit3, Loader2, AlertCircle } from 'lucide-react';
import type { PetGender, PetType, VaccineCode } from '../context/onboarding';
import { useOnboarding } from '../context/useOnboarding';
import { createPet, uploadProfileImage, PetApiError, PetNetworkError } from '../api/onboarding';

function toPetErrorMsg(e: unknown): string {
  if (e instanceof PetNetworkError) return '서버에 연결할 수 없어요. 네트워크를 확인해주세요.';
  if (e instanceof PetApiError) {
    if (e.status === 401) return '로그인이 만료됐어요. 다시 로그인해주세요.';
    if (e.status === 422) return `입력값 오류: ${e.message}`;
    if (e.status >= 500) return `서버 오류 (${e.status}). 잠시 후 다시 시도해주세요.`;
    return e.message;
  }
  return '등록에 실패했어요. 다시 시도해주세요.';
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
      {[1, 2, 3].map(s => (
        <div key={s} className="flex-1 rounded-full" style={{ height: '4px', backgroundColor: s <= step ? '#1B4B8C' : '#E8F0FA' }} />
      ))}
    </div>
  );
}

const VACCINE_LABELS: Record<VaccineCode, string> = {
  DHPPL: '종합백신 (DHPPL)',
  RABIES: '광견병',
  KENNEL_COUGH: '켄넬코프 (기관지염)',
  CORONA_ENTERITIS: '코로나 장염',
  HEARTWORM: '심장사상충 예방',
  PARASITE: '외부기생충 구제',
};

function formatPetType(petType: PetType | null) {
  if (petType === 'DOG') return '강아지 🐶';
  if (petType === 'CAT') return '고양이 🐱';
  return '미입력';
}

function getPetEmoji(petType: PetType | null) {
  if (petType === 'CAT') return '🐱';
  return '🐶';
}

function formatGender(gender: PetGender | null) {
  if (gender === 'MALE') return '수컷';
  if (gender === 'FEMALE') return '암컷';
  return '미입력';
}

function formatNeutered(isNeutered: boolean | null) {
  if (isNeutered === true) return '완료';
  if (isNeutered === false) return '미완료';
  return '미입력';
}

function formatAge(birthdate: string) {
  if (!birthdate) return '미입력';

  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return birthdate;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) age -= 1;

  return `만 ${Math.max(age, 0)}세 (${birth.getFullYear()}년생)`;
}

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const { step1, step2 } = useOnboarding();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!step1.photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(step1.photoFile);
    setPhotoPreviewUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [step1.photoFile]);

  const petName = step1.name || '반려동물';
  const summaryItems = [
    { label: '동물 유형', value: formatPetType(step1.petType) },
    { label: '이름', value: step1.name || '미입력' },
    { label: '품종', value: step1.breed || '미입력' },
    { label: '나이', value: formatAge(step1.birthdate) },
    { label: '체중', value: step1.weight ? `${step1.weight} kg` : '미입력' },
    {
      label: '성별',
      value: `${formatGender(step1.gender)} · 중성화 ${formatNeutered(step1.isNeutered)}`,
    },
  ];

  const vaccineItems = Object.entries(step2.vaccines).map(([code, completed]) => ({
    label: VACCINE_LABELS[code as VaccineCode],
    status: completed ? '완료' : '미완료',
    ok: completed,
  }));
  const healthItems = [
    { label: '최근 건강검진일', value: step2.lastCheckup || '미입력' },
    { label: '기존 질병 / 알레르기', value: step2.diseases || '미입력' },
  ];

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>반려동물 등록</span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 100%)', flexShrink: 0 }} />

        <ProgressBar step={3} />

        <div className="flex-1 overflow-y-auto px-5">
          {/* Success Header */}
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', boxShadow: '0 8px 24px rgba(27,75,140,0.3)' }}>
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt={`${petName} 사진 미리보기`}
                    className="w-full h-full rounded-full"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '40px' }}>{getPetEmoji(step1.petType)}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4CAF50', border: '2px solid white' }}>
                <CheckCircle2 size={16} style={{ color: 'white' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2B5E', textAlign: 'center', lineHeight: 1.3 }}>
              {petName} 등록이<br />완료되었어요!
            </h2>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px', textAlign: 'center' }}>
              입력 정보를 확인하고 홈으로 이동해주세요
            </p>
          </div>

          {/* STEP label */}
          <div className="mb-3">
            <p style={{ fontSize: '11px', color: '#6A9FD4', fontWeight: 600 }}>STEP 3 / 3 · 등록 완료</p>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>기본 정보</p>
              <button onClick={() => navigate('/onboarding/1')} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={12} style={{ color: 'white' }} />
                <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>수정</span>
              </button>
            </div>
            <div className="p-4 space-y-0">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < summaryItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccine Card */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #2E6DB4 0%, #6A9FD4 100%)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>예방접종 현황</p>
              <button onClick={() => navigate('/onboarding/2')} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={12} style={{ color: 'white' }} />
                <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>수정</span>
              </button>
            </div>
            <div className="p-4 space-y-0">
              {vaccineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < vaccineItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: item.ok ? '#2E7D32' : '#F57C00' }}>
                    {item.ok ? '✓ ' : '⚠ '}{item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Info Card */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #6A9FD4 0%, #8BB7E0 100%)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>추가 건강 정보</p>
              <button onClick={() => navigate('/onboarding/2')} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={12} style={{ color: 'white' }} />
                <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>수정</span>
              </button>
            </div>
            <div className="p-4 space-y-0">
              {healthItems.map((item, i) => (
                <div key={item.label} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: i < healthItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C', textAlign: 'right', lineHeight: 1.5 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's next */}
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '8px' }}>다음으로 할 수 있는 것들</p>
            <div className="space-y-2">
              {[
                { emoji: '📋', text: '진료 영수증 업로드 → AI 자동 분석' },
                { emoji: '🚶', text: '오늘의 산책·식사·음수량 기록' },
                { emoji: '📊', text: '데이터 축적 후 건강 리포트 확인' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '11px', color: '#0D2B5E' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5 space-y-2" style={{ paddingBottom: '28px', paddingTop: '12px', backgroundColor: '#F8FAFD' }}>
          {saveError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
              <AlertCircle size={14} style={{ color: '#C62828' }} />
              <span style={{ fontSize: '11px', color: '#C62828', fontWeight: 600 }}>{saveError}</span>
            </div>
          )}
          <button
            disabled={saving || confirmed}
            onClick={() => {
              void (async () => {
                if (saving || confirmed) return;
                setSaving(true);
                setSaveError('');
                try {
                  let profileImageUrl: string | undefined;
                  if (step1.photoFile) {
                    profileImageUrl = await uploadProfileImage(step1.photoFile);
                  }

                  await createPet({
                    type: step1.petType ?? 'DOG',
                    name: step1.name,
                    breed: step1.breed,
                    birthdate: step1.birthdate,
                    gender: step1.gender ?? 'MALE',
                    isNeutered: step1.isNeutered ?? false,
                    weightKg: parseFloat(step1.weight) || 0,
                    lastCheckupDate: step2.lastCheckup || undefined,
                    preExistingIllness: step2.diseases || undefined,
                    profileImageUrl,
                    vaccinations: Object.entries(step2.vaccines).map(([code, isCompleted]) => ({
                      code,
                      isCompleted,
                    })),
                  });
                  setConfirmed(true);
                  navigate('/home');
                } catch (e) {
                  setSaveError(toPetErrorMsg(e));
                } finally {
                  setSaving(false);
                }
              })();
            }}
            className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              height: '50px',
              background: confirmed
                ? 'linear-gradient(135deg, #2E7D32, #388E3C)'
                : 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
              opacity: saving ? 0.6 : 1,
              cursor: saving || confirmed ? 'not-allowed' : 'pointer',
            }}>
            {confirmed
              ? '이동 중...'
              : saving
                ? <><Loader2 size={16} className="animate-spin" /> 등록 중…</>
                : '홈으로 이동 →'}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
