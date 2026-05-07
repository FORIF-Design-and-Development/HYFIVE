import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function Screen4HScore() {
  const navigate = useNavigate();
  
  const lifeDataItems = [
    { label: '산책 달성률', score: 85, color: '#009688' },
    { label: '음수량 충족', score: 72, color: '#26A69A' },
    { label: '식사 규칙성', score: 90, color: '#42A5F5' },
    { label: '체중 유지', score: 78, color: '#FF7043' },
    { label: '배변 상태', score: 88, color: '#66BB6A' }
  ];

  const activityRate = 70;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progressLength = (activityRate / 100) * circumference;

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="코코의 건강 리포트" />
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">
            
            {/* Activity Rate Card */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ 
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              {/* Gradient top bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #009688, #00BFA5)' }} />
              
              <div className="p-5 flex items-center gap-5">
                {/* Donut Chart */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                    <svg
                      width="110"
                      height="110"
                      viewBox="0 0 110 110"
                      style={{ transform: 'rotate(-90deg)' }}
                    >
                      <circle
                        cx="55" cy="55" r={radius}
                        fill="none"
                        stroke="#E8F5E9"
                        strokeWidth="11"
                      />
                      <circle
                        cx="55" cy="55" r={radius}
                        fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={`${progressLength} ${circumference}`}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#009688" />
                          <stop offset="100%" stopColor="#00BFA5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '30px', fontWeight: 700, color: '#009688', lineHeight: 1 }}>
                        {activityRate}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>
                        / 100
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#E0F2F1' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#009688' }}>활동 달성률</span>
                  </div>
                </div>

                {/* Right Side Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span style={{ fontSize: '10px', color: '#9E9E9E', display: 'block', marginBottom: '3px' }}>건강 상태</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full" style={{ 
                      backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '12px', fontWeight: 700
                    }}>
                      ✓ 양호
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#9E9E9E', display: 'block', marginBottom: '3px' }}>이번 달 진료</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full" style={{ 
                      backgroundColor: '#E0F2F1', color: '#009688', fontSize: '12px', fontWeight: 700
                    }}>
                      1회
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#9E9E9E', display: 'block', marginBottom: '2px' }}>다음 검진 예정</span>
                    <span style={{ fontSize: '12px', color: '#1C1C1C', fontWeight: 600 }}>2026.06.01</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Life Data Summary */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>
                생활 데이터 현황
              </h3>
              
              <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1px solid #E0E0E0' }}>
                {lifeDataItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: item.color }}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
                
                <p style={{ 
                  fontSize: '9px', color: '#BDBDBD',
                  paddingTop: '8px', borderTop: '1px solid #F5F5F5'
                }}>
                  WSAVA / AAHA 가이드라인 기반 소형견·성견 기준
                </p>
              </div>
            </div>

            {/* Recent Visit Summary */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>
                최근 진료 이력
                <span style={{ fontSize: '10px', fontWeight: 400, color: '#9E9E9E', marginLeft: '6px' }}>
                  최근 3개월
                </span>
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {['피부과 2회', '내과 1회', '건강검진 1회'].map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full flex items-center gap-1" style={{ 
                    backgroundColor: '#E0F2F1', color: '#00695C', fontSize: '11px', fontWeight: 500
                  }}>
                    📋 {item}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '8px' }}>
                "최근 3개월 피부과 2회 방문 이력이 있어요"
              </p>
            </div>

            {/* Vaccination Schedule */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>
                예방접종 현황
              </h3>
              
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {/* Item 1 - Completed */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#4CAF50' }}>
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <Calendar size={15} style={{ color: '#9E9E9E', flexShrink: 0 }} />
                  <div className="flex-1">
                    <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600, display: 'block' }}>
                      심장사상충 예방
                    </span>
                    <span style={{ fontSize: '10px', color: '#4CAF50' }}>2025.10 완료</span>
                  </div>
                </div>

                {/* Item 2 - Alert */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFA726' }}>
                    <AlertTriangle size={13} style={{ color: 'white' }} />
                  </div>
                  <Calendar size={15} style={{ color: '#9E9E9E', flexShrink: 0 }} />
                  <div className="flex-1">
                    <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600, display: 'block' }}>
                      종합백신 (DHPPL)
                    </span>
                    <span style={{ fontSize: '10px', color: '#FFA726' }}>2026.04 예정 · 12개월 경과</span>
                  </div>
                </div>

                {/* Item 3 - Upcoming */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: '#E0E0E0' }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E0E0E0' }}></div>
                  </div>
                  <Calendar size={15} style={{ color: '#9E9E9E', flexShrink: 0 }} />
                  <div className="flex-1">
                    <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600, display: 'block' }}>
                      정기 건강검진
                    </span>
                    <span style={{ fontSize: '10px', color: '#9E9E9E' }}>2026.06 예정</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/insurance-claim')}
              className="flex-1 rounded-xl transition-all active:scale-[0.98]"
              style={{ 
                height: '48px',
                backgroundColor: 'white',
                border: '2px solid #009688',
                color: '#009688',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              생활 기록하기
            </button>
            <button
              onClick={() => navigate('/mission')}
              className="flex-1 rounded-xl transition-all active:scale-[0.98]"
              style={{ 
                height: '48px',
                background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(0,150,136,0.3)'
              }}
            >
              홈으로 가기 →
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
