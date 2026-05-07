import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { ChevronDown, Upload, CheckCircle2, Calendar } from 'lucide-react';

export default function Screen3HealthProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '코코',
    breed: '골든 리트리버',
    age: '만 3세 (2021년생)',
    weight: '28.5',
    gender: '수컷',
    neutered: '완료',
    fileUploaded: true,
    healthInfoConfirmed: true
  });
  
  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="상세 프로필 등록" />
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-5">
            
            {/* Section 1: 기본정보 */}
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '12px' }}>
                반려동물 기본정보
              </h2>
              
              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl px-4"
                    style={{ 
                      height: '42px', fontSize: '13px',
                      border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                      color: '#1C1C1C', outline: 'none'
                    }}
                  />
                </div>

                {/* Breed */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    품종
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.breed}
                      readOnly
                      className="w-full rounded-xl px-4 pr-10"
                      style={{ 
                        height: '42px', fontSize: '13px',
                        border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                        color: '#1C1C1C', outline: 'none'
                      }}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#009688' }} />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    나이
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.age}
                      readOnly
                      className="w-full rounded-xl px-4 pr-10"
                      style={{ 
                        height: '42px', fontSize: '13px',
                        border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                        color: '#1C1C1C', outline: 'none'
                      }}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#009688' }} />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    체중
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full rounded-xl px-4 pr-12"
                      style={{ 
                        height: '42px', fontSize: '13px',
                        border: '1.5px solid #E0E0E0', backgroundColor: 'white',
                        color: '#1C1C1C', outline: 'none'
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ 
                      fontSize: '12px', color: '#009688', fontWeight: 600
                    }}>kg</span>
                  </div>
                </div>

                {/* Gender Toggle */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    성별
                  </label>
                  <div className="flex gap-2">
                    {['수컷', '암컷'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        className="flex-1 rounded-xl transition-all"
                        style={{ 
                          height: '42px', fontSize: '13px', fontWeight: 600,
                          border: formData.gender === g ? '2px solid #009688' : '1.5px solid #E0E0E0',
                          backgroundColor: formData.gender === g ? '#009688' : 'white',
                          color: formData.gender === g ? 'white' : '#9E9E9E'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neutered Toggle */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '5px' }}>
                    중성화 여부
                  </label>
                  <div className="flex gap-2">
                    {['완료', '미완료'].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFormData({...formData, neutered: n})}
                        className="flex-1 rounded-xl transition-all"
                        style={{ 
                          height: '42px', fontSize: '13px', fontWeight: 600,
                          border: formData.neutered === n ? '2px solid #009688' : '1.5px solid #E0E0E0',
                          backgroundColor: formData.neutered === n ? '#009688' : 'white',
                          color: formData.neutered === n ? 'white' : '#9E9E9E'
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '8px', backgroundColor: '#EBEBEB', margin: '0 -20px' }}></div>

            {/* Section 2: 진료 기록 업로드 */}
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '8px' }}>
                진료 내역서 / 영수증 업로드
              </h2>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#009688', display: 'block', marginBottom: '8px' }}>
                동물병원 영수증 · 진료내역서
              </label>
              
              {formData.fileUploaded ? (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ 
                  border: '1.5px solid #E0E0E0', backgroundColor: 'white'
                }}>
                  <CheckCircle2 size={22} style={{ color: '#4CAF50', flexShrink: 0 }} />
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>
                      진료영수증_2026_03.jpg
                    </p>
                    <p style={{ fontSize: '10px', color: '#4CAF50' }}>파일 첨부 완료 · OCR 분석 대기</p>
                  </div>
                </div>
              ) : (
                <button className="w-full rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all" style={{ 
                  border: '2px dashed #009688', backgroundColor: 'white', height: '80px'
                }}>
                  <Upload size={20} style={{ color: '#009688' }} />
                  <span style={{ fontSize: '11px', color: '#009688', fontWeight: 600 }}>파일 선택</span>
                </button>
              )}
              
              <p style={{ fontSize: '10px', color: '#4CAF50', marginTop: '6px' }}>
                ✓ OCR로 핵심 정보를 자동 추출합니다
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: '8px', backgroundColor: '#EBEBEB', margin: '0 -20px' }}></div>

            {/* Section 3: 기초 건강 정보 */}
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>
                기초 건강 정보
              </h2>
              
              {/* Info Banner */}
              <div className="rounded-xl p-3 mb-3 flex items-center gap-2" style={{ backgroundColor: '#FFF8E1' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>📋</span>
                <p style={{ fontSize: '10px', color: '#F57C00', lineHeight: '1.4' }}>
                  기초 건강 정보를 입력하면 더 정확한 리포트가 생성됩니다
                </p>
              </div>

              {formData.healthInfoConfirmed ? (
                /* Health info confirmed state */
                <div className="rounded-xl overflow-hidden" style={{ 
                  border: '2px solid #4CAF50', backgroundColor: 'white'
                }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} style={{ color: '#009688' }} />
                        <span style={{ fontSize: '11px', color: '#9E9E9E' }}>마지막 건강검진</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1C1C1C' }}>2025.11.15</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '11px', color: '#9E9E9E' }}>예방접종 현황</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#4CAF50' }}>종합백신 완료</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="w-full rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all" style={{ 
                  border: '2px dashed #009688', backgroundColor: 'white', height: '100px'
                }}>
                  <Calendar size={24} style={{ color: '#009688' }} />
                  <div className="text-center">
                    <p style={{ fontSize: '12px', color: '#009688', fontWeight: 600, marginBottom: '2px' }}>
                      기초 건강 정보 입력
                    </p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                      마지막 검진일·예방접종 현황을 입력해주세요
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button
            onClick={() => navigate('/h-score')}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ 
              height: '48px',
              background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,150,136,0.3)'
            }}
          >
            AI 분석 시작
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
