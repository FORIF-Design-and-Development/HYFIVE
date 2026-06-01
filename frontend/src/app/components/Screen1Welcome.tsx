import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { getPets, PetApiError, PetNetworkError } from '../api/onboarding';
import lionLogo from 'figma:asset/49bb8708313cd2aee9d6c816e878c53a7e094241.png';

export default function Screen1Welcome() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'new' | 'existing' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddConfirm, setShowAddConfirm] = useState(false);

  const resolveError = (e: unknown): string => {
    if (e instanceof PetNetworkError) return '서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.';
    if (e instanceof PetApiError) {
      if (e.status === 401) return '로그인이 만료되었어요. 다시 로그인해주세요.';
      return e.message || '반려동물 정보를 불러오지 못했어요.';
    }
    return '반려동물 정보를 불러오지 못했어요.';
  };

  const handleNext = async () => {
    if (!selectedType || loading) return;
    setError('');
    setLoading(true);
    try {
      const pets = await getPets();
      const hasPets = pets.length > 0;

      if (selectedType === 'existing') {
        // 등록된 반려동물이 없으면 관리 화면으로 보낼 수 없음 → 이 화면에 머물며 안내
        if (hasPets) navigate('/home');
        else setError('아직 등록된 반려동물이 없어요. 먼저 반려동물을 등록해주세요.');
      } else {
        // new — 이미 펫이 있으면 추가 등록 여부를 한 번 더 확인
        if (hasPets) setShowAddConfirm(true);
        else navigate('/onboarding/1');
      }
    } catch (e) {
      setError(resolveError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="relative h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        
        {/* App Header Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 bg-white" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#1B4B8C' }}>
              <img src={lionLogo} alt="HYFIVE" style={{ width: '24px', height: '24px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B4B8C', fontFamily: "'Nunito', sans-serif" }}>HYFIVE</span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        {/* Hero Banner */}
        <div className="flex-shrink-0 px-5 py-5" style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>로그인 성공 · HYFIVE</p>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '6px' }}>
                반갑습니다! 🎉
              </h1>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>무엇을 하시겠어요?</p>
            </div>
            <div style={{ fontSize: '52px' }}>🐾</div>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          
          <button onClick={() => { setSelectedType('new'); setError(''); }}
            className="w-full rounded-xl p-4 flex flex-col items-start transition-all active:scale-[0.98]"
            style={{ 
              border: selectedType === 'new' ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
              backgroundColor: selectedType === 'new' ? '#E8F0FA' : 'white',
              boxShadow: selectedType === 'new' ? '0 4px 16px rgba(27,75,140,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
              minHeight: '110px'
            }}>
            <div className="flex items-start justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'new' ? '#1B4B8C' : '#F5F5F5' }}>
                  <span style={{ fontSize: '18px' }}>🐶</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: selectedType === 'new' ? '#1B4B8C' : '#1C1C1C' }}>반려동물 등록하기</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#E8F0FA', color: '#1B4B8C', fontSize: '10px', fontWeight: 600 }}>신규 등록</span>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'new' ? '#1B4B8C' : '#E0E0E0' }}>
                  {selectedType === 'new' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: selectedType === 'new' ? '#0D2B5E' : '#9E9E9E', textAlign: 'left', paddingLeft: '44px' }}>새 반려동물 프로필을 등록하고 건강 관리를 시작해요</span>
          </button>

          <button onClick={() => { setSelectedType('existing'); setError(''); }}
            className="w-full rounded-xl p-4 flex flex-col items-start transition-all active:scale-[0.98]"
            style={{ 
              border: selectedType === 'existing' ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
              backgroundColor: selectedType === 'existing' ? '#E8F0FA' : 'white',
              boxShadow: selectedType === 'existing' ? '0 4px 16px rgba(27,75,140,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
              minHeight: '110px'
            }}>
            <div className="flex items-start justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'existing' ? '#1B4B8C' : '#F5F5F5' }}>
                  <span style={{ fontSize: '18px' }}>🏠</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: selectedType === 'existing' ? '#1B4B8C' : '#1C1C1C' }}>반려동물 관리하기</span>
              </div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'existing' ? '#1B4B8C' : '#E0E0E0' }}>
                {selectedType === 'existing' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: selectedType === 'existing' ? '#0D2B5E' : '#9E9E9E', textAlign: 'left', paddingLeft: '44px' }}>등록된 반려동물의 건강 기록을 이어서 관리해요</span>
          </button>

          <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', paddingTop: '4px' }}>선택 후 시작하기를 눌러주세요</p>
        </div>

        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          {error && (
            <div className="rounded-xl px-4 py-3 mb-3 flex items-start gap-2" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
              <span style={{ fontSize: '14px', flexShrink: 0, lineHeight: '18px' }}>⚠️</span>
              <p style={{ fontSize: '12px', color: '#C62828', fontWeight: 600, lineHeight: 1.4 }}>{error}</p>
            </div>
          )}
          <button onClick={handleNext} disabled={!selectedType || loading}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{
              height: '48px',
              background: selectedType && !loading ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0',
              color: 'white', fontSize: '14px', fontWeight: 700,
              cursor: selectedType && !loading ? 'pointer' : 'not-allowed',
              boxShadow: selectedType && !loading ? '0 4px 16px rgba(27,75,140,0.35)' : 'none'
            }}>
            {loading
              ? '확인 중...'
              : selectedType === 'new'
                ? '반려동물 프로필 등록하기 →'
                : selectedType === 'existing'
                  ? '기록 관리 바로 시작하기 →'
                  : '유형을 선택해주세요'}
          </button>
        </div>

        {/* 추가 등록 확인 다이얼로그 — 이미 펫이 있는데 '등록하기'를 선택한 경우 */}
        {showAddConfirm && (
          <div
            className="absolute inset-0 flex items-end justify-center"
            style={{ backgroundColor: 'rgba(13,43,94,0.45)', zIndex: 50 }}
            onClick={() => setShowAddConfirm(false)}
          >
            <div
              className="w-full bg-white rounded-t-2xl px-5 pt-5"
              style={{ paddingBottom: '32px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#E8F0FA' }}>
                  <span style={{ fontSize: '24px' }}>🐾</span>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#0D2B5E', marginBottom: '6px' }}>이미 등록된 반려동물이 있어요</p>
                <p style={{ fontSize: '12px', color: '#6A7A90', lineHeight: 1.5 }}>새로운 반려동물을 추가로 등록하시겠어요?</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddConfirm(false)}
                  className="flex-1 rounded-xl"
                  style={{ height: '48px', backgroundColor: '#F5F5F5', color: '#9E9E9E', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  onClick={() => { setShowAddConfirm(false); navigate('/onboarding/1'); }}
                  className="flex-1 rounded-xl"
                  style={{ height: '48px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  추가 등록하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}