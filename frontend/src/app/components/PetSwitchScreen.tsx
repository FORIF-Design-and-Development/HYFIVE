import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Check, Plus, ChevronRight, Star } from 'lucide-react';
import {
  type PetProfileResponse,
  listPets,
  activatePet,
  petEmoji,
  petTag,
  petGenderText,
} from '../api/profile';

interface PetDisplay {
  id: number;
  name: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  emoji: string;
  isActive: boolean;
  tag: string;
}

function toPetDisplay(p: PetProfileResponse): PetDisplay {
  return {
    id: p.petId,
    name: p.name,
    breed: p.breed ?? '',
    age: p.ageYears != null ? `만 ${p.ageYears}세` : '',
    weight: p.weightKg != null ? `${p.weightKg}kg` : '',
    gender: petGenderText(p.gender, p.isNeutered),
    emoji: petEmoji(p.type),
    isActive: p.isActive,
    tag: petTag(p.type, p.dogSize),
  };
}

export default function PetSwitchScreen() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetDisplay[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPets()
      .then((data) => {
        const display = data.map(toPetDisplay);
        setPets(display);
        const active = data.find((p) => p.isActive);
        setSelectedId(active?.petId ?? data[0]?.petId ?? null);
      })
      .catch(() => setError('프로필 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleConfirm = async () => {
    if (selectedId == null) return;
    const alreadyActive = pets.find((p) => p.id === selectedId)?.isActive;
    if (alreadyActive) {
      navigate('/home');
      return;
    }
    setSwitching(true);
    try {
      await activatePet(selectedId);
      navigate('/home');
    } catch {
      setSwitching(false);
      setError('프로필 전환에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedId);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>
        <NavHeader title="프로필 전환" subtitle="반려동물을 선택하세요" />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 space-y-3 pb-6">

            {/* Current active */}
            <div className="flex items-center gap-2 mb-1">
              <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E' }}>현재 활성 프로필</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p style={{ fontSize: '13px', color: '#9E9E9E' }}>불러오는 중...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFF3F3', border: '1px solid #FFCDD2' }}>
                <p style={{ fontSize: '12px', color: '#C62828' }}>{error}</p>
              </div>
            )}

            {/* Pet Cards */}
            {!loading && !error && pets.map((pet) => {
              const isSelected = selectedId === pet.id;
              const wasActive = pet.isActive;
              return (
                <button
                  key={pet.id}
                  onClick={() => handleSelect(pet.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'white',
                    border: isSelected ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                    boxShadow: isSelected ? '0 4px 16px rgba(27,75,140,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Active badge */}
                  {wasActive && (
                    <div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#1B4B8C' }}>현재 보호중</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                          : 'linear-gradient(135deg, #F0F5FF 0%, #E8F0FA 100%)',
                        border: isSelected ? 'none' : '1.5px solid #C5D8EE',
                        boxShadow: isSelected ? '0 3px 12px rgba(27,75,140,0.3)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '34px' }}>{pet.emoji}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p style={{ fontSize: '16px', fontWeight: 800, color: isSelected ? '#0D2B5E' : '#1C1C1C' }}>
                          {pet.name}
                        </p>
                        <span
                          className="px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isSelected ? '#E8F0FA' : '#F5F5F5',
                            color: isSelected ? '#1B4B8C' : '#9E9E9E',
                            fontSize: '9px',
                            fontWeight: 700,
                          }}
                        >
                          {pet.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#555', marginBottom: '1px' }}>{pet.breed}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                        {pet.age} · {pet.weight} · {pet.gender}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        backgroundColor: isSelected ? '#1B4B8C' : 'transparent',
                        border: `2px solid ${isSelected ? '#1B4B8C' : '#BDBDBD'}`,
                      }}
                    >
                      {isSelected && <Check size={13} style={{ color: 'white' }} />}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Register New Pet */}
            <button
              onClick={() => navigate('/onboarding/1')}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'white',
                border: '1.5px dashed #C5D8EE',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#E8F0FA', border: '1.5px dashed #6A9FD4' }}
              >
                <Plus size={24} style={{ color: '#1B4B8C' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4B8C' }}>반려동물 등록</p>
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>새로운 반려동물을 추가하세요</p>
              </div>
              <ChevronRight size={16} style={{ color: '#BDBDBD', flexShrink: 0 }} />
            </button>

            {/* Info Note */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
              <p style={{ fontSize: '11px', color: '#2E6DB4', fontWeight: 500 }}>
                프로필을 전환하면 홈 화면에 선택한 반려동물의 기록이 표시됩니다.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-4 py-4 bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
          {selectedPet && (
            <p style={{ fontSize: '11px', color: '#9E9E9E', textAlign: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: '#1B4B8C' }}>{selectedPet.name}</span>
              {selectedPet.isActive ? ' — 이미 활성화된 프로필이에요' : ' 로 프로필을 전환합니다'}
            </p>
          )}
          <button
            onClick={handleConfirm}
            disabled={switching || selectedId == null}
            className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              height: '52px',
              background: switching
                ? 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)'
                : 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
              boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              transition: 'all 0.3s',
            }}
          >
            {switching ? (
              <>
                <Check size={18} />
                전환 완료!
              </>
            ) : (
              '이 프로필로 전환'
            )}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
