import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

export default function Screen1Welcome() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'new' | 'existing' | null>(null);

  const handleNext = () => {
    if (selectedType === 'new') navigate('/onboarding/1');
    if (selectedType === 'existing') navigate('/home');
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        
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
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>AI 기반 반려동물 건강 통합 관리</p>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '6px' }}>
                HYFIVE 시작하기
              </h1>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>어떤 반려인이신가요?</p>
            </div>
            <div style={{ fontSize: '52px' }}>🐾</div>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          
          <button onClick={() => setSelectedType('new')}
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
                <span style={{ fontSize: '14px', fontWeight: 700, color: selectedType === 'new' ? '#1B4B8C' : '#1C1C1C' }}>처음 시작해요</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#E8F0FA', color: '#1B4B8C', fontSize: '10px', fontWeight: 600 }}>신규 등록</span>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'new' ? '#1B4B8C' : '#E0E0E0' }}>
                  {selectedType === 'new' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: selectedType === 'new' ? '#0D2B5E' : '#9E9E9E', textAlign: 'left', paddingLeft: '44px' }}>반려동물 프로필 등록 후 건강 관리 시작</span>
          </button>

          <button onClick={() => setSelectedType('existing')}
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
                <span style={{ fontSize: '14px', fontWeight: 700, color: selectedType === 'existing' ? '#1B4B8C' : '#1C1C1C' }}>이미 등록했어요</span>
              </div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedType === 'existing' ? '#1B4B8C' : '#E0E0E0' }}>
                {selectedType === 'existing' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: selectedType === 'existing' ? '#0D2B5E' : '#9E9E9E', textAlign: 'left', paddingLeft: '44px' }}>기존 데이터 이어서 건강 기록 관리하기</span>
          </button>

          <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', paddingTop: '4px' }}>선택 후 시작하기를 눌러주세요</p>
        </div>

        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button onClick={handleNext} disabled={!selectedType}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ 
              height: '48px',
              background: selectedType ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0',
              color: 'white', fontSize: '14px', fontWeight: 700,
              cursor: selectedType ? 'pointer' : 'not-allowed',
              boxShadow: selectedType ? '0 4px 16px rgba(27,75,140,0.35)' : 'none'
            }}>
            {selectedType === 'new' ? '반려동물 프로필 등록하기 →' : selectedType === 'existing' ? '기록 관리 바로 시작하기 →' : '유형을 선택해주세요'}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}