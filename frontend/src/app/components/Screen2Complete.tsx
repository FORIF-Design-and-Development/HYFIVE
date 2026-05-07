import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Check, FileText, Activity, BarChart2, CheckCircle2 } from 'lucide-react';

export default function Screen2Complete() {
  const navigate = useNavigate();
  
  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ 
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        <NavHeader title="반려동물 등록" />
        
        {/* Success Banner */}
        <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Check size={24} style={{ color: '#009688' }} />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '2px'
              }}>
                프로필 등록 완료!
              </p>
              <p style={{ 
                fontSize: '11px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                이제 건강 관리를 시작할 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Feature Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E0E0E0' }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} style={{ color: '#009688' }} />
                <h3 style={{ 
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1C1C1C'
                }}>
                  사용 가능한 기능
                </h3>
              </div>

              {/* Feature Items */}
              <div className="space-y-3">
                {/* Feature 1 */}
                <div className="flex items-start gap-3 pb-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <FileText size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ 
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1C1C1C',
                      marginBottom: '2px'
                    }}>
                      AI 스마트 진료 기록부
                    </p>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#9E9E9E'
                    }}>
                      OCR로 영수증 자동 분석 및 저장
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded" style={{ 
                    backgroundColor: '#E0F2F1',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#009688'
                  }}>
                    활성화
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3 pb-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <Activity size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ 
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1C1C1C',
                      marginBottom: '2px'
                    }}>
                      라이프스타일 로그
                    </p>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#9E9E9E'
                    }}>
                      산책·식사·음수량 매일 기록
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <BarChart2 size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ 
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1C1C1C',
                      marginBottom: '2px'
                    }}>
                      팩트 기반 건강 리포트
                    </p>
                    <p style={{ 
                      fontSize: '11px',
                      color: '#9E9E9E'
                    }}>
                      데이터 축적 후 자동 생성
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded" style={{ 
                    backgroundColor: '#FFF8E1',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#F57C00'
                  }}>
                    준비 중
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E0E0E0' }}>
              <h4 style={{ 
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C1C1C',
                marginBottom: '8px'
              }}>
                등록 정보
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>반려동물</span>
                  <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 500 }}>코코</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>등록 일시</span>
                  <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 500 }}>2026.03.26 10:15</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>등록 방법</span>
                  <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 500 }}>직접 입력</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-6" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button
            onClick={() => navigate('/health-profile')}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ 
              height: '48px',
              background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,150,136,0.3)'
            }}
          >
            상세 프로필 등록하기 →
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
