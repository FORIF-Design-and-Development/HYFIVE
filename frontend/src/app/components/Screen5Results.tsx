import { useState } from 'react';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Check, Shield, Heart, Stethoscope, Home, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Screen5Results() {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('premium');
  
  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ 
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        <NavHeader title="AI 분석 결과" />
        
        {/* Success Header */}
        <div className="px-6 py-4" style={{ backgroundColor: '#E0F2F1' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check size={24} style={{ color: '#009688' }} />
            </div>
            <div>
              <p style={{ 
                fontSize: '13px',
                fontWeight: 700,
                color: '#1C1C1C',
                marginBottom: '2px'
              }}>
                코코에게 딱 맞는 플랜을 찾았어요!
              </p>
              <p style={{ 
                fontSize: '11px',
                color: '#00695C'
              }}>
                입양 할인 30% 적용됨
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Health Risk Assessment */}
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E0E0E0' }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} style={{ color: '#009688' }} />
                <h3 style={{ 
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1C1C1C'
                }}>
                  AI 건강 위험도 분석
                </h3>
              </div>

              {/* Risk Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
                    <span style={{ fontSize: '11px', color: '#1C1C1C' }}>관절 질환</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                      <div className="h-full rounded-full" style={{ width: '45%', backgroundColor: '#4CAF50' }}></div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 700 }}>낮음</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFA726' }}></div>
                    <span style={{ fontSize: '11px', color: '#1C1C1C' }}>피부 질환</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                      <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: '#FFA726' }}></div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#FFA726', fontWeight: 700 }}>중간</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
                    <span style={{ fontSize: '11px', color: '#1C1C1C' }}>심장 질환</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                      <div className="h-full rounded-full" style={{ width: '25%', backgroundColor: '#4CAF50' }}></div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 700 }}>낮음</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h3 style={{ 
                fontSize: '13px',
                fontWeight: 700,
                color: '#1C1C1C',
                marginBottom: '12px'
              }}>
                추천 보험 플랜
              </h3>

              <div className="space-y-3">
                {/* Premium Plan */}
                <button
                  onClick={() => setSelectedPlan('premium')}
                  className="w-full bg-white rounded-xl p-5 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    border: selectedPlan === 'premium' ? '2px solid #009688' : '1px solid #E0E0E0',
                    boxShadow: selectedPlan === 'premium' ? '0 4px 16px rgba(0, 150, 136, 0.15)' : 'none'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ 
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1C1C1C'
                        }}>
                          프리미엄 케어
                        </span>
                        <span className="px-2 py-0.5 rounded-full" style={{ 
                          backgroundColor: '#009688',
                          color: 'white',
                          fontSize: '9px',
                          fontWeight: 700
                        }}>
                          AI 추천
                        </span>
                      </div>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>골든 리트리버 최적화</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
                      border: selectedPlan === 'premium' ? '2px solid #009688' : '2px solid #E0E0E0',
                      backgroundColor: selectedPlan === 'premium' ? '#009688' : 'transparent'
                    }}>
                      {selectedPlan === 'premium' && (
                        <Check size={12} style={{ color: 'white' }} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span style={{ 
                      fontSize: '10px',
                      color: '#9E9E9E',
                      textDecoration: 'line-through'
                    }}>
                      월 45,000원
                    </span>
                    <span style={{ 
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#009688'
                    }}>
                      31,500
                    </span>
                    <span style={{ 
                      fontSize: '12px',
                      color: '#1C1C1C'
                    }}>
                      원/월
                    </span>
                    <span className="px-2 py-0.5 rounded-full ml-1" style={{ 
                      backgroundColor: '#E53935',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700
                    }}>
                      30% ↓
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check size={14} style={{ color: '#009688', marginTop: '1px' }} />
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>연간 최대 1,000만원 보장</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} style={{ color: '#009688', marginTop: '1px' }} />
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>수술/입원 90% 보장</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} style={{ color: '#009688', marginTop: '1px' }} />
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>피부 질환 특화 보장</span>
                    </div>
                  </div>
                </button>

                {/* Standard Plan */}
                <button
                  onClick={() => setSelectedPlan('standard')}
                  className="w-full bg-white rounded-xl p-5 text-left transition-all active:scale-[0.98]"
                  style={{ 
                    border: selectedPlan === 'standard' ? '2px solid #009688' : '1px solid #E0E0E0',
                    boxShadow: selectedPlan === 'standard' ? '0 4px 16px rgba(0, 150, 136, 0.15)' : 'none'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span style={{ 
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#1C1C1C',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        스탠다드
                      </span>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>기본 보장</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
                      border: selectedPlan === 'standard' ? '2px solid #009688' : '2px solid #E0E0E0',
                      backgroundColor: selectedPlan === 'standard' ? '#009688' : 'transparent'
                    }}>
                      {selectedPlan === 'standard' && (
                        <Check size={12} style={{ color: 'white' }} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span style={{ 
                      fontSize: '10px',
                      color: '#9E9E9E',
                      textDecoration: 'line-through'
                    }}>
                      월 28,000원
                    </span>
                    <span style={{ 
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#009688'
                    }}>
                      19,600
                    </span>
                    <span style={{ 
                      fontSize: '12px',
                      color: '#1C1C1C'
                    }}>
                      원/월
                    </span>
                    <span className="px-2 py-0.5 rounded-full ml-1" style={{ 
                      backgroundColor: '#E53935',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700
                    }}>
                      30% ↓
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check size={14} style={{ color: '#009688', marginTop: '1px' }} />
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>연간 최대 500만원 보장</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={14} style={{ color: '#009688', marginTop: '1px' }} />
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>수술/입원 70% 보장</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E0E0E0' }}>
              <h3 style={{ 
                fontSize: '13px',
                fontWeight: 700,
                color: '#1C1C1C',
                marginBottom: '12px'
              }}>
                주요 보장 내역
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <Stethoscope size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>
                      진료비 보장
                    </p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                      일반 진료부터 전문 치료까지
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <Heart size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>
                      수술 보장
                    </p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                      응급 수술 및 계획 수술 포함
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E0F2F1' }}>
                    <Home size={16} style={{ color: '#009688' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>
                      입원 보장
                    </p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                      입원 치료비 및 간병비
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 flex items-center justify-center gap-1 rounded-lg transition-all" style={{ 
                backgroundColor: '#F5F5F5',
                color: '#009688',
                fontSize: '11px',
                fontWeight: 500
              }}>
                <span>전체 보장 내역 보기</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Important Notice */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF8E1' }}>
              <div className="flex items-start gap-2">
                <AlertCircle size={16} style={{ color: '#F57C00', marginTop: '1px' }} />
                <div>
                  <p style={{ 
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#F57C00',
                    marginBottom: '4px'
                  }}>
                    가입 전 확인사항
                  </p>
                  <p style={{ 
                    fontSize: '9px',
                    color: '#F57C00',
                    lineHeight: '1.5'
                  }}>
                    • 보험 약관을 반드시 확인해 주세요<br />
                    • 기존 질병은 보장 대상에서 제외될 수 있습니다<br />
                    • 갱신 시 보험료가 조정될 수 있습니다
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom spacing for CTA */}
            <div className="h-20"></div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="relative">
          <div className="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          <div className="bg-white px-6 py-4 border-t" style={{ borderColor: '#E0E0E0' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '11px', color: '#9E9E9E' }}>
                {selectedPlan === 'premium' ? '프리미엄 케어' : '스탠다드'}
              </span>
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#009688' }}>
                  {selectedPlan === 'premium' ? '31,500' : '19,600'}
                </span>
                <span style={{ fontSize: '11px', color: '#1C1C1C' }}>원/월</span>
              </div>
            </div>
            <button
              className="w-full rounded-lg transition-all active:scale-[0.98]"
              style={{ 
                height: '44px',
                backgroundColor: '#009688',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              가입하기
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
