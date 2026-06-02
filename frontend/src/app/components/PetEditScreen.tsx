import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Camera, Check, Image, X } from 'lucide-react';
import { type PetProfileResponse, getActivePet, updatePet, petEmoji } from '../api/profile';
import { uploadProfileImage } from '../api/onboarding';

type NeuterStatus = 'completed' | 'not_done' | 'unknown';

function neuterStatusFromBool(isNeutered: boolean): NeuterStatus {
  return isNeutered ? 'completed' : 'not_done';
}

export default function PetEditScreen() {
  const navigate = useNavigate();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [pet, setPet] = useState<PetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [neuterStatus, setNeuterStatus] = useState<NeuterStatus>('completed');
  const [weight, setWeight] = useState('');
  const [weightError, setWeightError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    getActivePet()
      .then((data) => {
        setPet(data);
        setNeuterStatus(neuterStatusFromBool(data.isNeutered));
        setWeight(data.weightKg != null ? String(data.weightKg) : '');
      })
      .catch(() => setError('반려동물 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleWeightChange = (val: string) => {
    setWeight(val);
    const num = parseFloat(val);
    if (!val) setWeightError('');
    else if (isNaN(num) || num <= 0 || num > 200) setWeightError('올바른 체중을 입력해주세요 (0.1 ~ 200kg)');
    else setWeightError('');
  };

  const adjustWeight = (delta: number) => {
    const curr = parseFloat(weight) || 0;
    const next = Math.max(0.1, Math.round((curr + delta) * 10) / 10);
    setWeight(String(next));
    setWeightError('');
  };

  const handlePhotoFile = async (file: File) => {
    setShowPhotoSheet(false);
    const preview = URL.createObjectURL(file);
    setLocalPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    setPhotoUploading(true);
    try {
      const s3Url = await uploadProfileImage(file);
      setPendingPhotoUrl(s3Url);
    } catch {
      setError('사진 업로드에 실패했습니다. 다시 시도해주세요.');
      setLocalPhotoUrl(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    if (weightError || !weight || !pet) return;
    setSaved(true);
    try {
      await updatePet(pet.petId, {
        isNeutered: neuterStatus === 'completed',
        weightKg: parseFloat(weight),
        ...(pendingPhotoUrl ? { profileImageUrl: pendingPhotoUrl } : {}),
      });
      setTimeout(() => navigate('/home'), 900);
    } catch {
      setSaved(false);
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const currentPhotoUrl = localPhotoUrl ?? pet?.profileImageUrl ?? null;

  const neuterOptions: { value: NeuterStatus; label: string; desc: string; emoji: string }[] = [
    { value: 'completed', label: '중성화 완료', desc: '수술을 마쳤어요', emoji: '✅' },
    { value: 'not_done', label: '미실시', desc: '아직 수술 전이에요', emoji: '⭕' },
  ];

  if (loading) {
    return (
      <MobileFrame>
        <div className="h-full flex items-center justify-center" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          <p style={{ fontSize: '13px', color: '#9E9E9E' }}>불러오는 중...</p>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>
        <NavHeader title="정보 수정" subtitle={pet ? `${pet.name}의 정보를 업데이트하세요` : '정보를 업데이트하세요'} />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 space-y-5 pb-6">

            {/* Error banner */}
            {error && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFF3F3', border: '1px solid #FFCDD2' }}>
                <p style={{ fontSize: '12px', color: '#C62828' }}>{error}</p>
              </div>
            )}

            {/* Section: Pet Photo */}
            <section>
              <SectionLabel num={1} text="반려동물 사진" />
              <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                {/* Hidden file inputs */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }}
                />

                {/* Avatar */}
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #E8F0FA 0%, #C5D8EE 100%)', border: '2px solid #C5D8EE' }}
                  >
                    {currentPhotoUrl ? (
                      <img src={currentPhotoUrl} alt={pet?.name ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: '52px' }}>{pet ? petEmoji(pet.type) : '🐾'}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPhotoSheet(true)}
                    disabled={photoUploading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: photoUploading ? '#9E9E9E' : '#1B4B8C', border: '2.5px solid white', boxShadow: '0 2px 8px rgba(27,75,140,0.35)', cursor: photoUploading ? 'not-allowed' : 'pointer' }}
                  >
                    <Camera size={14} style={{ color: 'white' }} />
                  </button>
                </div>
                <div className="text-center">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{pet?.name ?? ''}</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>
                    {photoUploading ? '업로드 중...' : '탭하여 사진 변경'}
                  </p>
                </div>

                <div className="flex gap-2 w-full">
                  
                  
                </div>
              </div>
            </section>

            {/* Section: Neutering */}
            <section>
              <SectionLabel num={2} text="중성화 여부" />
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                {neuterOptions.map((opt, i) => {
                  const isSelected = neuterStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNeuterStatus(opt.value)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all active:bg-gray-50"
                      style={{
                        borderBottom: i < neuterOptions.length - 1 ? '1px solid #F5F5F5' : 'none',
                        backgroundColor: isSelected ? '#F0F5FF' : 'white',
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{opt.emoji}</span>
                      <div className="flex-1">
                        <p style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1B4B8C' : '#1C1C1C' }}>
                          {opt.label}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>{opt.desc}</p>
                      </div>
                      {/* Radio indicator */}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: isSelected ? '#1B4B8C' : 'transparent',
                          border: `2px solid ${isSelected ? '#1B4B8C' : '#BDBDBD'}`,
                        }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Section: Weight */}
            <section>
              <SectionLabel num={3} text="현재 체중" />
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                {/* Main stepper row */}
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      className="w-full text-center outline-none bg-transparent"
                      style={{
                        fontSize: '36px',
                        fontWeight: 800,
                        color: weightError ? '#EF5350' : '#0D2B5E',
                        fontFamily: "'Noto Sans KR', sans-serif",
                        border: 'none',
                        lineHeight: 1,
                      }}
                      step="0.1"
                      min="0.1"
                      max="200"
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6A9FD4', marginTop: '2px' }}>kg</span>
                  </div>
                </div>

                {weightError && (
                  <p style={{ fontSize: '11px', color: '#EF5350', marginTop: '10px', textAlign: 'center' }}>{weightError}</p>
                )}
              </div>
            </section>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-4 py-4 bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
          <button
            onClick={handleSave}
            disabled={!!weightError || !weight}
            className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              height: '52px',
              background: saved
                ? 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)'
                : weightError || !weight
                ? 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)'
                : 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
              boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              cursor: weightError || !weight ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {saved ? (
              <>
                <Check size={18} />
                수정 완료!
              </>
            ) : (
              '수정 완료'
            )}
          </button>
          <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', marginTop: '8px' }}>
            변경사항은 저장 후 홈 화면에 반영됩니다
          </p>
        </div>
      </div>

      {/* Photo Change Bottom Sheet */}
      {showPhotoSheet && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowPhotoSheet(false)}
          />
          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 z-50 bg-white"
            style={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>프로필 사진 변경</p>
              <button
                onClick={() => setShowPhotoSheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} style={{ color: '#9E9E9E' }} />
              </button>
            </div>

            {/* Options */}
            <div className="px-5 py-5 space-y-3" style={{ paddingBottom: '32px' }}>
              {/* Camera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  height: '79px',
                  backgroundColor: '#E8F0FA',
                  border: '1.5px solid #C5D8EE',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B4B8C' }}>
                  <Camera size={20} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4B8C' }}>카메라로 촬영</p>
                  <p style={{ fontSize: '11px', color: '#6A9FD4', marginTop: '2px' }}>바로 사진 촬영하기</p>
                </div>
              </button>

              {/* Gallery */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  height: '79px',
                  backgroundColor: 'white',
                  border: '1.5px solid #E0E0E0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F0FA' }}>
                  <Image size={20} style={{ color: '#1B4B8C' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4B8C' }}>갤러리에서 선택</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>저장된 사진 불러오기</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </MobileFrame>
  );
}

function SectionLabel({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#1B4B8C' }}
      >
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'white' }}>{num}</span>
      </div>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>{text}</p>
    </div>
  );
}