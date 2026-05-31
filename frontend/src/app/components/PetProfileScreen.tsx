import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import BottomNav from './BottomNav';
import { Edit2, RefreshCw, Heart, Scale, Calendar, ChevronRight, ChevronDown, Check, X, Camera } from 'lucide-react';

type PetType = 'DOG' | 'CAT';
type PetGender = 'MALE' | 'FEMALE';
type VaccineCode = 'DHPPL' | 'RABIES' | 'KENNEL_COUGH' | 'CORONA_ENTERITIS' | 'HEARTWORM' | 'PARASITE';

const VACCINE_LIST: { code: VaccineCode; label: string }[] = [
  { code: 'DHPPL', label: '종합백신 (DHPPL)' },
  { code: 'RABIES', label: '광견병' },
  { code: 'KENNEL_COUGH', label: '켄넬코프 (기관지염)' },
  { code: 'CORONA_ENTERITIS', label: '코로나 장염' },
  { code: 'HEARTWORM', label: '심장사상충 예방' },
  { code: 'PARASITE', label: '외부기생충 구제' },
];

const DOG_BREEDS = ['골든 리트리버', '래브라도 리트리버', '말티즈', '포메라니안', '시츄', '비숑 프리제', '푸들', '진돗개', '프렌치 불독', '웰시 코기', '비글', '사모예드', '기타'];
const CAT_BREEDS = ['아메리칸 숏헤어', '스코티시 폴드', '페르시안', '러시안 블루', '메인쿤', '브리티시 숏헤어', '벵갈', '샴', '코리안 숏헤어', '노르웨이 숲속 고양이', '기타'];

interface PetForm {
  petType: PetType;
  name: string;
  breed: string;
  birthdate: string;
  weight: string;
  gender: PetGender;
  isNeutered: boolean;
  vaccines: Record<VaccineCode, boolean>;
  lastCheckup: string;
  diseases: string;
}

const INITIAL_FORM: PetForm = {
  petType: 'DOG',
  name: '코코',
  breed: '골든 리트리버',
  birthdate: '2021-03-12',
  weight: '28.5',
  gender: 'MALE',
  isNeutered: true,
  vaccines: {
    DHPPL: true,
    RABIES: true,
    KENNEL_COUGH: false,
    CORONA_ENTERITIS: false,
    HEARTWORM: true,
    PARASITE: true,
  },
  lastCheckup: '2025-02-15',
  diseases: '없음',
};

function formatAge(birthdate: string): string {
  if (!birthdate) return '미입력';
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return birthdate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const passed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!passed) age -= 1;
  return `만 ${Math.max(age, 0)}세 (${birth.getFullYear()}년생)`;
}

export default function PetProfileScreen() {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PetForm>(INITIAL_FORM);
  const [draft, setDraft] = useState<PetForm>(INITIAL_FORM);
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreviewUrl(curr => { if (curr) URL.revokeObjectURL(curr); return URL.createObjectURL(file); });
    setPhotoFile(file);
  };

  const startEdit = () => {
    setDraft(form);
    setIsCustomBreed(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(form);
    setIsCustomBreed(false);
    setIsEditing(false);
  };

  const saveEdit = () => {
    setForm(draft);
    setIsCustomBreed(false);
    setIsEditing(false);
  };

  const breedList = draft.petType === 'CAT' ? CAT_BREEDS : DOG_BREEDS;

  const handleBreedSelect = (breed: string) => {
    if (breed === '기타') {
      setDraft(f => ({ ...f, breed: '' }));
      setIsCustomBreed(true);
      setShowBreedPicker(false);
      return;
    }
    setDraft(f => ({ ...f, breed }));
    setIsCustomBreed(false);
    setShowBreedPicker(false);
  };

  const petEmoji = form.petType === 'CAT' ? '🐱' : '🐶';

  return (
    <MobileFrame>
      <div
        className="h-full flex flex-col"
        style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC', position: 'relative' }}
      >
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

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
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)' }}
                  >
                    {photoPreviewUrl ? (
                      <img src={photoPreviewUrl} alt="반려동물 사진" className="w-full h-full" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '44px', lineHeight: 1 }}>{petEmoji}</span>
                    )}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#6A9FD4', border: '2px solid rgba(255,255,255,0.5)' }}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Camera size={10} style={{ color: 'white' }} />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                      {form.name || '반려동물'}
                    </p>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}
                    >
                      {form.petType === 'CAT' ? '고양이' : '대형견'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>
                    {form.breed || '품종 미입력'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>등록번호 410191-000XXXX</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { icon: <Calendar size={10} />, text: formatAge(form.birthdate) },
                  { icon: <Scale size={10} />, text: form.weight ? `${form.weight} kg` : '체중 미입력' },
                  { icon: <Heart size={10} />, text: `${form.gender === 'FEMALE' ? '암컷' : '수컷'} · 중성화 ${form.isNeutered ? '완료' : '미완료'}` },
                  { icon: null, text: 'HYFIVE 등록' },
                ].map((tag, i) => (
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={startEdit}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ height: '40px', background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', fontWeight: 700, fontSize: '13px' }}
                >
                  <Edit2 size={14} />
                  정보 수정
                </button>
                <button
                  onClick={() => navigate('/profile/switch')}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ height: '40px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '13px' }}
                >
                  <RefreshCw size={14} />
                  프로필 전환
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-3 pb-4">
            {isEditing ? (
              <>
                {/* Basic Info Edit Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1.5px solid #C5D8EE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>🐾</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>기본 정보</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Pet Type (read-only) */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '6px' }}>동물 유형 <span style={{ fontWeight: 400 }}>(변경 불가)</span></label>
                      <div className="flex gap-2">
                        {([{ value: 'DOG' as PetType, label: '강아지', emoji: '🐶' }, { value: 'CAT' as PetType, label: '고양이', emoji: '🐱' }]).map(item => (
                          <div
                            key={item.value}
                            className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                            style={{ border: draft.petType === item.value ? '2px solid #C5D8EE' : '1.5px solid #E0E0E0', backgroundColor: draft.petType === item.value ? '#F0F4FA' : '#FAFAFA' }}
                          >
                            <span style={{ fontSize: '16px', opacity: draft.petType === item.value ? 1 : 0.35 }}>{item.emoji}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: draft.petType === item.value ? '#6A8BB8' : '#BDBDBD' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Name (read-only) */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '5px' }}>이름 <span style={{ fontWeight: 400 }}>(변경 불가)</span></label>
                      <div
                        className="w-full rounded-xl px-4 flex items-center"
                        style={{ height: '44px', fontSize: '13px', border: '1.5px solid #E0E0E0', backgroundColor: '#FAFAFA', color: '#9E9E9E' }}
                      >
                        {draft.name}
                      </div>
                    </div>

                    {/* Breed */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>품종</label>
                      <div className="relative">
                        <button
                          onClick={() => setShowBreedPicker(true)}
                          className="w-full rounded-xl px-4 pr-10 flex items-center text-left"
                          style={{ height: '44px', fontSize: '13px', border: isCustomBreed || draft.breed ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: 'white', color: isCustomBreed || draft.breed ? '#1C1C1C' : '#BDBDBD' }}
                        >
                          {isCustomBreed ? '기타 (직접 입력)' : draft.breed || '품종을 선택해주세요'}
                        </button>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#1B4B8C' }} />
                      </div>
                      {isCustomBreed && (
                        <input
                          type="text"
                          value={draft.breed}
                          onChange={e => setDraft(f => ({ ...f, breed: e.target.value }))}
                          placeholder="품종을 직접 입력해주세요"
                          className="w-full rounded-xl px-4 mt-2"
                          style={{ height: '44px', fontSize: '13px', border: '1.5px solid #C5D8EE', backgroundColor: 'white', color: '#1C1C1C', outline: 'none' }}
                        />
                      )}
                    </div>

                    {/* Birthdate */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>생년월일</label>
                      <input
                        type="date"
                        value={draft.birthdate}
                        onChange={e => setDraft(f => ({ ...f, birthdate: e.target.value }))}
                        className="w-full rounded-xl px-4"
                        style={{ height: '44px', fontSize: '13px', border: '1.5px solid #E0E0E0', backgroundColor: 'white', color: '#1C1C1C', outline: 'none' }}
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>체중 (kg)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={draft.weight}
                          onChange={e => setDraft(f => ({ ...f, weight: e.target.value }))}
                          className="w-full rounded-xl px-4 pr-12"
                          style={{ height: '44px', fontSize: '15px', fontWeight: 600, border: draft.weight ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: draft.weight ? '#E8F0FA' : 'white', color: '#0D2B5E', outline: 'none', textAlign: 'center' }}
                          step="0.1" min="0.1" max="200"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ fontSize: '13px', color: '#1B4B8C', fontWeight: 600 }}>kg</span>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>성별</label>
                      <div className="flex gap-2">
                        {([{ value: 'MALE' as PetGender, label: '수컷', icon: '♂' }, { value: 'FEMALE' as PetGender, label: '암컷', icon: '♀' }]).map(g => (
                          <button key={g.value} onClick={() => setDraft(f => ({ ...f, gender: g.value }))}
                            className="flex-1 rounded-xl transition-all"
                            style={{ height: '44px', fontSize: '13px', fontWeight: 600, border: draft.gender === g.value ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: draft.gender === g.value ? '#1B4B8C' : 'white', color: draft.gender === g.value ? 'white' : '#9E9E9E' }}>
                            {g.icon} {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Neutered */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>중성화 여부</label>
                      <div className="flex gap-2">
                        {([{ value: true, label: '완료' }, { value: false, label: '미완료' }]).map(n => (
                          <button key={String(n.value)} onClick={() => setDraft(f => ({ ...f, isNeutered: n.value }))}
                            className="flex-1 rounded-xl transition-all"
                            style={{ height: '44px', fontSize: '13px', fontWeight: 600, border: draft.isNeutered === n.value ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: draft.isNeutered === n.value ? '#1B4B8C' : 'white', color: draft.isNeutered === n.value ? 'white' : '#9E9E9E' }}>
                            {n.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vaccine Edit Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1.5px solid #C5D8EE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>💉</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>예방접종 현황</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {VACCINE_LIST.map(v => {
                      const isOn = draft.vaccines[v.code];
                      return (
                        <div
                          key={v.code}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ border: isOn ? '1.5px solid #C5D8EE' : '1.5px solid #E0E0E0', backgroundColor: isOn ? '#F5F8FE' : 'white' }}
                        >
                          <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: isOn ? '#1B4B8C' : '#1C1C1C' }}>{v.label}</span>
                          <button
                            onClick={() => setDraft(f => ({ ...f, vaccines: { ...f.vaccines, [v.code]: !f.vaccines[v.code] } }))}
                            className="relative rounded-full flex-shrink-0"
                            style={{ width: '46px', height: '26px', backgroundColor: isOn ? '#1B4B8C' : '#E0E0E0' }}
                          >
                            <div
                              className="absolute top-[3px] rounded-full"
                              style={{ width: '20px', height: '20px', backgroundColor: 'white', left: isOn ? '23px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s ease' }}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Health Info Edit Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1.5px solid #C5D8EE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>🏥</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>추가 건강 정보</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '5px' }}>최근 건강검진일</label>
                      <input
                        type="date"
                        value={draft.lastCheckup}
                        onChange={e => setDraft(f => ({ ...f, lastCheckup: e.target.value }))}
                        className="w-full rounded-xl px-4"
                        style={{ height: '44px', fontSize: '13px', border: draft.lastCheckup ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: draft.lastCheckup ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '5px' }}>기존 질병 / 알레르기</label>
                      <textarea
                        value={draft.diseases}
                        onChange={e => setDraft(f => ({ ...f, diseases: e.target.value }))}
                        placeholder="현재 앓고 있거나 과거 진단받은 질병"
                        rows={2}
                        className="w-full rounded-xl px-4 py-3"
                        style={{ fontSize: '12px', border: draft.diseases ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: draft.diseases ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Basic Info View Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>🐾</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>기본 정보</p>
                  </div>
                  <div className="px-4">
                    {[
                      { label: '동물 유형', value: form.petType === 'CAT' ? '고양이 🐱' : '강아지 🐶' },
                      { label: '이름', value: form.name || '미입력' },
                      { label: '품종', value: form.breed || '미입력' },
                      { label: '나이', value: formatAge(form.birthdate) },
                      { label: '체중', value: form.weight ? `${form.weight} kg` : '미입력' },
                      { label: '성별', value: `${form.gender === 'FEMALE' ? '암컷' : '수컷'} · 중성화 ${form.isNeutered ? '완료' : '미완료'}` },
                    ].map((item, i, arr) => (
                      <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                        <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vaccine View Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>💉</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>예방접종 현황</p>
                  </div>
                  <div className="px-4">
                    {VACCINE_LIST.map((v, i) => (
                      <div key={v.code} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < VACCINE_LIST.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                        <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{v.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: form.vaccines[v.code] ? '#2E7D32' : '#F57C00' }}>
                          {form.vaccines[v.code] ? '✓ 완료' : '⚠ 미완료'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Info View Card */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '14px' }}>🏥</span>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>추가 건강 정보</p>
                  </div>
                  <div className="px-4">
                    {[
                      { label: '최근 건강검진일', value: form.lastCheckup || '미입력' },
                      { label: '기존 질병 / 알레르기', value: form.diseases || '미입력' },
                    ].map((item, i, arr) => (
                      <div key={i} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                        <span style={{ fontSize: '11px', color: '#9E9E9E', flexShrink: 0 }}>{item.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C', textAlign: 'right', lineHeight: 1.5 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Report Button */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 100%)', boxShadow: '0 4px 16px rgba(13,43,94,0.25)' }}
                >
                  <button
                    onClick={() => navigate('/report')}
                    className="w-full rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.97]"
                    style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '12px', fontWeight: 700 }}
                  >
                    <span>건강 리포트 보기</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </>
            )}

            <div style={{ height: '4px' }} />
          </div>
        </div>

        {isEditing && (
          <div
            className="flex-shrink-0 flex gap-3 px-4 py-3 bg-white"
            style={{ borderTop: '1px solid #EBEBEB' }}
          >
            <button
              onClick={cancelEdit}
              className="rounded-xl flex items-center justify-center gap-1 px-5 transition-all active:scale-[0.97]"
              style={{ height: '48px', backgroundColor: '#F5F5F5', border: '1.5px solid #E0E0E0', color: '#9E9E9E', fontWeight: 700, fontSize: '14px' }}
            >
              <X size={15} />
              취소
            </button>
            <button
              onClick={saveEdit}
              className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ height: '48px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', border: 'none', color: 'white', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(27,75,140,0.3)' }}
            >
              <Check size={15} />
              수정 완료
            </button>
          </div>
        )}

        <BottomNav active="home" />

        {/* Breed Picker Bottom Sheet */}
        {showBreedPicker && (
          <div
            className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowBreedPicker(false)}
          >
            <div
              className="bg-white rounded-t-3xl overflow-hidden"
              style={{ maxHeight: '70%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>품종 선택</span>
                <button
                  onClick={() => setShowBreedPicker(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F5F5F5' }}
                >
                  <X size={16} style={{ color: '#9E9E9E' }} />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                {breedList.map(breed => (
                  <button
                    key={breed}
                    onClick={() => handleBreedSelect(breed)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between transition-all active:bg-blue-50"
                    style={{ borderBottom: '1px solid #F5F5F5' }}
                  >
                    <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: draft.breed === breed ? 700 : 400 }}>{breed}</span>
                    {draft.breed === breed && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L7 12L13 4" stroke="#1B4B8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
