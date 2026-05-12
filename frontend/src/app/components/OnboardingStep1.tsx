import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Camera, ChevronDown, X } from 'lucide-react';
import { useOnboarding } from '../context/useOnboarding';

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
      {[1, 2, 3].map(s => (
        <div key={s} className="flex-1 rounded-full" style={{ height: '4px', backgroundColor: s <= step ? '#1B4B8C' : '#E8F0FA', transition: 'background-color 0.3s' }} />
      ))}
    </div>
  );
}

const DOG_BREEDS = ['골든 리트리버', '래브라도 리트리버', '말티즈', '포메라니안', '시츄', '비숑 프리제', '푸들', '진돗개', '프렌치 불독', '웰시 코기', '비글', '사모예드', '기타'];
const CAT_BREEDS = ['아메리칸 숏헤어', '스코티시 폴드', '페르시안', '러시안 블루', '메인쿤', '브리티시 숏헤어', '벵갈', '샴', '코리안 숏헤어', '노르웨이 숲속 고양이', '기타'];

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const { step1, updateStep1 } = useOnboarding();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [petType, setPetType] = useState<'dog' | 'cat' | null>(step1.petType);
  const [form, setForm] = useState({ name: step1.name, breed: step1.breed, birthdate: step1.birthdate, gender: step1.gender, neutered: step1.neutered, weight: step1.weight });
  const [photoFile, setPhotoFile] = useState<File | null>(step1.photoFile);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(() => step1.photoFile ? URL.createObjectURL(step1.photoFile) : null);
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const breedList = petType === 'cat' ? CAT_BREEDS : DOG_BREEDS;
  const canProceed = petType !== null && form.name.length > 0 && form.gender && form.neutered;

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handleBreedSelect = (breed: string) => {
    if (breed === '기타') {
      setForm({ ...form, breed: '' });
      setIsCustomBreed(true);
      setShowBreedPicker(false);
      return;
    }

    setForm({ ...form, breed });
    setIsCustomBreed(false);
    setShowBreedPicker(false);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return URL.createObjectURL(file);
    });
    setPhotoFile(file);
  };

  const handleNext = () => {
    updateStep1({
      petType,
      ...form,
      photoFile,
    });
    navigate('/onboarding/2');
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>반려동물 등록</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <ProgressBar step={1} />

        {/* Step label */}
        <div className="flex-shrink-0 px-5 pt-4 pb-2">
          <p style={{ fontSize: '11px', color: '#6A9FD4', fontWeight: 600 }}>STEP 1 / 3</p>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2B5E', marginTop: '2px' }}>반려동물을 등록해주세요</h2>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">

          {/* Pet Type Selector */}
          <div className="mb-4">
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '8px' }}>동물 유형 *</label>
            <div className="flex gap-3">
              {[
                { type: 'dog' as const, label: '강아지', emoji: '🐶' },
                { type: 'cat' as const, label: '고양이', emoji: '🐱' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => { setPetType(item.type); setForm(f => ({ ...f, breed: '' })); setIsCustomBreed(false); }}
                  className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    border: petType === item.type ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                    backgroundColor: petType === item.type ? '#E8F0FA' : 'white',
                    boxShadow: petType === item.type ? '0 4px 16px rgba(27,75,140,0.15)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{item.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: petType === item.type ? '#1B4B8C' : '#9E9E9E' }}>{item.label}</span>
                  {petType === item.type && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1B4B8C' }}>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="flex flex-col items-center py-4">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="rounded-2xl flex items-center justify-center transition-all active:scale-95 overflow-hidden"
                aria-label="반려동물 사진 업로드"
                title={photoFile?.name || '반려동물 사진 업로드'}
                style={{
                  width: '112px',
                  height: '112px',
                  backgroundColor: photoPreviewUrl ? 'white' : '#F5F8FE',
                  border: photoPreviewUrl ? '2px solid #1B4B8C' : '2px dashed #6A9FD4',
                  boxShadow: photoPreviewUrl ? '0 8px 22px rgba(27,75,140,0.16)' : 'none',
                }}
              >
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt={photoFile ? `${photoFile.name} 미리보기` : '반려동물 사진 미리보기'}
                    className="w-full h-full"
                    style={{ objectFit: 'contain', backgroundColor: '#F8FAFD' }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                      <Camera size={20} style={{ color: '#1B4B8C' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700 }}>사진 추가</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
                aria-label={photoPreviewUrl ? '반려동물 사진 변경' : '반려동물 사진 추가'}
                style={{
                  backgroundColor: '#1B4B8C',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(27,75,140,0.32)',
                }}
              >
                <Camera size={15} style={{ color: 'white' }} />
              </button>
            </div>
            {photoFile && (
              <div className="mt-3 px-3 py-1.5 rounded-full max-w-full" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                <p className="truncate" style={{ maxWidth: '180px', fontSize: '10px', color: '#1B4B8C', fontWeight: 600 }}>
                  {photoFile.name}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="반려동물 이름을 입력해주세요"
                className="w-full rounded-xl px-4"
                style={{ height: '44px', fontSize: '13px', border: form.name ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.name ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
              />
            </div>

            {/* Breed */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>품종</label>
              <div className="relative">
                <button
                  onClick={() => petType && setShowBreedPicker(true)}
                  className="w-full rounded-xl px-4 pr-10 flex items-center text-left"
                  style={{ height: '44px', fontSize: '13px', border: isCustomBreed || form.breed ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: petType ? 'white' : '#F5F5F5', color: isCustomBreed || form.breed ? '#1C1C1C' : '#BDBDBD' }}
                >
                  {isCustomBreed ? '기타 (직접 입력)' : form.breed || (petType ? '품종을 선택해주세요' : '동물 유형을 먼저 선택해주세요')}
                </button>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#1B4B8C' }} />
              </div>
              {isCustomBreed && (
                <input
                  type="text"
                  value={form.breed}
                  onChange={e => setForm({ ...form, breed: e.target.value })}
                  placeholder="품종을 직접 입력해주세요"
                  className="w-full rounded-xl px-4 mt-2"
                  style={{ height: '44px', fontSize: '13px', border: form.breed ? '2px solid #1B4B8C' : '1.5px solid #C5D8EE', backgroundColor: form.breed ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
                />
              )}
            </div>

            {/* Birthdate */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>생년월일</label>
              <input
                type="date"
                value={form.birthdate}
                onChange={e => setForm({ ...form, birthdate: e.target.value })}
                className="w-full rounded-xl px-4"
                style={{ height: '44px', fontSize: '13px', border: '1.5px solid #E0E0E0', backgroundColor: 'white', color: '#1C1C1C', outline: 'none' }}
              />
            </div>

            {/* Gender */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>성별 *</label>
              <div className="flex gap-2">
                {['수컷', '암컷'].map(g => (
                  <button key={g} onClick={() => setForm({ ...form, gender: g })}
                    className="flex-1 rounded-xl transition-all"
                    style={{ height: '44px', fontSize: '13px', fontWeight: 600, border: form.gender === g ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.gender === g ? '#1B4B8C' : 'white', color: form.gender === g ? 'white' : '#9E9E9E' }}>
                    {g === '수컷' ? '♂ 수컷' : '♀ 암컷'}
                  </button>
                ))}
              </div>
            </div>

            {/* Neutered */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>중성화 여부 *</label>
              <div className="flex gap-2">
                {['완료', '미완료'].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, neutered: n })}
                    className="flex-1 rounded-xl transition-all"
                    style={{ height: '44px', fontSize: '13px', fontWeight: 600, border: form.neutered === n ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.neutered === n ? '#1B4B8C' : 'white', color: form.neutered === n ? 'white' : '#9E9E9E' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>현재 체중 (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  placeholder="0.0"
                  className="w-full rounded-xl px-4 pr-12"
                  style={{ height: '44px', fontSize: '15px', fontWeight: 600, border: form.weight ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.weight ? '#E8F0FA' : 'white', color: '#0D2B5E', outline: 'none', textAlign: 'center' }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ fontSize: '13px', color: '#1B4B8C', fontWeight: 600 }}>kg</span>
              </div>
              <p style={{ fontSize: '10px', color: '#BDBDBD', marginTop: '4px', textAlign: 'center' }}>대략적인 값을 입력해도 괜찮아요</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '28px', paddingTop: '12px', backgroundColor: '#F8FAFD' }}>
          <button onClick={handleNext} disabled={!canProceed}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ height: '50px', background: canProceed ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0', color: 'white', fontSize: '15px', fontWeight: 700, cursor: canProceed ? 'pointer' : 'not-allowed', boxShadow: canProceed ? '0 4px 16px rgba(27,75,140,0.3)' : 'none' }}>
            다음
          </button>
        </div>
      </div>

      {/* Breed Picker Sheet */}
      {showBreedPicker && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: '70%' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>품종 선택</span>
              <button onClick={() => setShowBreedPicker(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
                <X size={16} style={{ color: '#9E9E9E' }} />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {breedList.map(breed => (
                <button key={breed} onClick={() => handleBreedSelect(breed)}
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between transition-all active:bg-blue-50"
                  style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: form.breed === breed ? 700 : 400 }}>{breed}</span>
                  {form.breed === breed && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L7 12L13 4" stroke="#1B4B8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
