import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import BottomNav from './BottomNav';
import { Edit2, RefreshCw, Heart, Scale, Syringe, Calendar, ChevronRight, Camera } from 'lucide-react';
import { type PetProfileResponse, getActivePet, updatePet, petEmoji, petTag, petGenderText } from '../api/profile';
import { uploadProfileImage } from '../api/onboarding';

const petStats = [
  { icon: '🏃', label: '이번 주 산책', value: '3회', sub: '총 85분', color: '#E8F0FA', iconBg: '#C5D8EE' },
  { icon: '🍖', label: '오늘 식사', value: '2회', sub: '권장량 100%', color: '#E8F5E9', iconBg: '#C8E6C9' },
  { icon: '💧', label: '오늘 음수량', value: '420ml', sub: '목표 대비 84%', color: '#E3F2FD', iconBg: '#BBDEFB' },
  { icon: '🏥', label: '최근 진료', value: '2주 전', sub: '피부과 진료', color: '#FFF8E1', iconBg: '#FFE082' },
];

const vaccineRecords = [
  { name: '광견병', date: '2024.10.15', dNext: '2025.10.15', status: '정상', color: '#2E7D32', bg: '#E8F5E9' },
  { name: '종합백신', date: '2024.10.15', dNext: '2025.10.15', status: '정상', color: '#2E7D32', bg: '#E8F5E9' },
  { name: '심장사상충', date: '2025.03.01', dNext: '2025.04.01', status: '투약 필요', color: '#E65100', bg: '#FFF3E0' },
];

export default function PetProfileScreen() {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [pet, setPet] = useState<PetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getActivePet()
      .then(setPet)
      .catch(() => setError('반려동물 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
    };
  }, [localPhotoUrl]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pet) return;

    const preview = URL.createObjectURL(file);
    setLocalPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });

    setUploading(true);
    try {
      const s3Url = await uploadProfileImage(file);
      await updatePet(pet.petId, { profileImageUrl: s3Url });
      setPet((prev) => prev ? { ...prev, profileImageUrl: s3Url } : prev);
      setLocalPhotoUrl(null);
    } catch {
      // 업로드 실패 시 로컬 미리보기 유지, 다음 새로고침에서 원복됨
    } finally {
      setUploading(false);
    }
  };

  const currentPhotoUrl = localPhotoUrl ?? pet?.profileImageUrl ?? null;

  if (loading) {
    return (
      <MobileFrame>
        <div className="h-full flex items-center justify-center" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          <p style={{ fontSize: '13px', color: '#9E9E9E' }}>불러오는 중...</p>
        </div>
      </MobileFrame>
    );
  }

  type InfoTag = { icon: React.JSX.Element; text: string };
  const infoTags: InfoTag[] = [
    pet?.ageYears != null
      ? { icon: <Calendar size={10} />, text: `만 ${pet.ageYears}세${pet.birthdate ? ` (${pet.birthdate.replace(/-/g, '.')})` : ''}` }
      : null,
    pet?.weightKg != null
      ? { icon: <Scale size={10} />, text: `${pet.weightKg} kg` }
      : null,
    pet
      ? { icon: <Heart size={10} />, text: petGenderText(pet.gender, pet.isNeutered) }
      : null,
  ].filter((t): t is InfoTag => t !== null);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>
        <NavHeader title="반려동물 프로필" />

        <div className="flex-1 overflow-y-auto">
          {/* Hero Card */}
          <div className="px-4 pt-4 pb-2">
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 60%, #2E6DB4 100%)',
                boxShadow: '0 6px 24px rgba(13,43,94,0.35)',
              }}
            >
              {/* Error banner */}
              {error && (
                <div className="rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{error}</p>
                </div>
              )}

              {/* Avatar + Basic Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)' }}
                  >
                    {currentPhotoUrl ? (
                      <img
                        src={currentPhotoUrl}
                        alt={pet?.name ?? '반려동물'}
                        className="w-full h-full"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '44px', lineHeight: 1 }}>{pet ? petEmoji(pet.type) : '🐾'}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: uploading ? '#9E9E9E' : '#6A9FD4',
                      border: '2px solid rgba(255,255,255,0.5)',
                    }}
                    onClick={() => !uploading && photoInputRef.current?.click()}
                    aria-label="프로필 사진 업로드"
                    disabled={uploading}
                  >
                    <Camera size={10} style={{ color: 'white' }} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                      {pet?.name ?? '—'}
                    </p>
                    {pet && (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}
                      >
                        {petTag(pet.type, pet.dogSize)}
                      </span>
                    )}
                  </div>
                  {pet?.breed && (
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>{pet.breed}</p>
                  )}
                </div>
              </div>

              {/* Info Tags Row */}
              {infoTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {infoTags.map((tag, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.75)' }}>{tag.icon}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{tag.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: '40px',
                    background: 'rgba(255,255,255,0.22)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  <Edit2 size={14} />
                  정보 수정
                </button>
                <button
                  onClick={() => navigate('/profile/switch')}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: '40px',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  <RefreshCw size={14} />
                  프로필 전환
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-3 pb-4">
            {/* Quick Stats */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>오늘의 건강 현황</p>
              <div className="grid grid-cols-2 gap-2">
                {petStats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{ backgroundColor: 'white', border: '1px solid #E8E8E8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: stat.color }}
                    >
                      <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '1px' }}>{stat.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{stat.value}</p>
                      <p style={{ fontSize: '9px', color: '#BDBDBD' }}>{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vaccine / Prevention */}
            <div>
              <div className="flex items-center mb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>예방접종 · 투약 현황</p>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {vaccineRecords.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center px-4 py-3"
                    style={{ borderBottom: i < vaccineRecords.length - 1 ? '1px solid #F5F5F5' : 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"
                      style={{ backgroundColor: v.bg }}
                    >
                      <Syringe size={14} style={{ color: v.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C' }}>{v.name}</p>
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: v.bg, color: v.color, fontSize: '9px', fontWeight: 700 }}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>
                        최근: {v.date} · 다음: {v.dNext}
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color: '#BDBDBD' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Health Report */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 100%)', boxShadow: '0 4px 16px rgba(13,43,94,0.25)' }}
            >
              <button
                onClick={() => navigate('/report')}
                className="w-full rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.97]"
                style={{
                  height: '36px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <span>건강 리포트 보기</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ height: '4px' }} />
          </div>
        </div>

        <BottomNav active="home" />
      </div>
    </MobileFrame>
  );
}
