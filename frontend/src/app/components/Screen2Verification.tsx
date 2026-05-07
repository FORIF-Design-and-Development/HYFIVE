import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Search, QrCode, Link2 } from 'lucide-react';

type MethodType = 'manual' | 'scan' | 'import' | null;

export default function Screen2Verification() {
  const navigate = useNavigate();
  const [petName, setPetName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('manual');
  
  const handleNext = () => {
    if (petName.length >= 1) {
      navigate('/verification-complete');
    }
  };

  const methods = [
    {
      id: 'manual' as MethodType,
      icon: <Link2 size={20} />,
      title: '직접 입력',
      desc: '반려동물 정보 수동 입력',
      badge: '추천',
      badgeBg: '#FFF8E1',
      badgeColor: '#F57C00',
    },
    {
      id: 'scan' as MethodType,
      icon: <QrCode size={20} />,
      title: '동물등록증 스캔',
      desc: 'QR/바코드로 자동 불러오기',
      badge: null,
      badgeBg: '',
      badgeColor: '',
    },
    {
      id: 'import' as MethodType,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      title: '다른 앱에서 가져오기',
      desc: '기존 앱 데이터 연동',
      badge: null,
      badgeBg: '',
      badgeColor: '',
    },
  ];
  
  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="반려동물 등록" subtitle="STEP 1 / 2" />
        
        {/* Step Indicator */}
        <div className="flex-shrink-0 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
              backgroundColor: '#009688', color: 'white', fontSize: '10px', fontWeight: 700
            }}>1</div>
            <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#E0E0E0' }}>
              <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: '#009688' }}></div>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
              backgroundColor: '#E0E0E0', color: '#9E9E9E', fontSize: '10px', fontWeight: 700
            }}>2</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">
            
            {/* Section Title */}
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>
              등록 방법 선택
            </h2>

            {/* Method Cards */}
            <div className="space-y-2">
              {methods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="w-full rounded-xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                    style={{ 
                      border: isSelected ? '2px solid #009688' : '1.5px solid #E0E0E0',
                      backgroundColor: isSelected ? '#E0F2F1' : 'white',
                      boxShadow: isSelected ? '0 2px 12px rgba(0,150,136,0.15)' : 'none',
                    }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ 
                      backgroundColor: isSelected ? '#009688' : '#F5F5F5',
                      color: isSelected ? 'white' : '#009688'
                    }}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ 
                          fontSize: '12px', fontWeight: 700,
                          color: isSelected ? '#009688' : '#1C1C1C'
                        }}>
                          {method.title}
                        </span>
                        {method.badge && (
                          <span className="px-2 py-0.5 rounded-full" style={{ 
                            backgroundColor: method.badgeBg, color: method.badgeColor,
                            fontSize: '9px', fontWeight: 600
                          }}>
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: isSelected ? '#00695C' : '#9E9E9E' }}>
                        {method.desc}
                      </p>
                    </div>
                    {/* Selection indicator */}
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{
                      backgroundColor: isSelected ? '#009688' : '#E0E0E0'
                    }}>
                      {isSelected && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-[1px]" style={{ backgroundColor: '#E8E8E8' }}></div>

            {/* Input Section */}
            <div>
              <label style={{ 
                fontSize: '12px', fontWeight: 700, color: '#1C1C1C',
                display: 'block', marginBottom: '8px'
              }}>
                반려동물 이름 입력
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="예: 코코"
                  className="w-full rounded-xl px-4 pr-12 transition-all"
                  style={{ 
                    height: '44px',
                    fontSize: '13px',
                    border: petName ? '2px solid #009688' : '1.5px solid #E0E0E0',
                    backgroundColor: petName ? '#E0F2F1' : '#F8F8F8',
                    color: '#1C1C1C',
                    outline: 'none'
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: petName ? '#009688' : '#9E9E9E' }}>
                  <Search size={18} />
                </div>
              </div>
              <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '6px' }}>
                이름은 언제든지 수정할 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button
            onClick={handleNext}
            disabled={petName.length < 1}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ 
              height: '48px',
              background: petName.length >= 1 
                ? 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)' 
                : '#E0E0E0',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: petName.length >= 1 ? 'pointer' : 'not-allowed',
              boxShadow: petName.length >= 1 ? '0 4px 16px rgba(0,150,136,0.3)' : 'none'
            }}
          >
            다음으로
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
