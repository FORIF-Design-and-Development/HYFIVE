import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Activity, CheckCircle2, Footprints } from 'lucide-react';

export default function Screen5InsuranceClaim() {
  const navigate = useNavigate();
  const [walkLogged] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { navigate('/trends'); }, 800);
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="생활 데이터 입력" subtitle="오늘의 기록" />

        {/* Progress Steps */}
        <div className="flex-shrink-0 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <div className="flex items-center justify-center gap-2">
            {['산책 기록', '식사 기록', '건강 기록'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: i === 0 ? '#1B4B8C' : '#E0E0E0' }}>
                    {i === 0 ? (
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#9E9E9E', fontWeight: 700 }}>{i + 1}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '9px', color: i === 0 ? '#1B4B8C' : '#9E9E9E', fontWeight: i === 0 ? 700 : 400 }}>{step}</span>
                </div>
                {i < 2 && <div className="w-10 h-1 rounded-full mb-3" style={{ backgroundColor: i === 0 ? '#1B4B8C' : '#E0E0E0' }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">

            {/* Walk shortcut banner */}
            <button onClick={() => navigate('/walk')}
              className="w-full rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)', boxShadow: '0 4px 12px rgba(27,75,140,0.25)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Footprints size={20} style={{ color: 'white' }} />
              </div>
              <div className="flex-1 text-left">
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>GPS 산책 기록 시작</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>실시간 경로·거리·칼로리 측정</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Walk Section */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>오늘의 산책 기록</h3>
              {walkLogged ? (
                <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #E0E0E0', backgroundColor: 'white' }}>
                  <div className="p-4 flex items-start gap-3">
                    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F0FA', width: '52px', height: '64px' }}>
                      <Activity size={28} style={{ color: '#1B4B8C' }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '3px' }}>오늘 산책 완료</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '8px' }}>산책 2회 · 총 45분</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} style={{ color: '#4CAF50' }} />
                        <span style={{ fontSize: '11px', color: '#4CAF50', fontWeight: 700 }}>기록 완료</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="w-full rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all" style={{ border: '2px dashed #1B4B8C', backgroundColor: 'white', minHeight: '110px' }}>
                  <Activity size={28} style={{ color: '#1B4B8C' }} />
                  <div className="text-center">
                    <p style={{ fontSize: '12px', color: '#1B4B8C', fontWeight: 700, marginBottom: '3px' }}>산책 기록 입력</p>
                    <p style={{ fontSize: '10px', color: '#2E6DB4' }}>횟수 및 시간을 입력해 주세요</p>
                  </div>
                </button>
              )}
            </div>

            {/* Food Log */}
            {walkLogged && (
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>오늘의 식사 기록</h3>
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', borderLeft: '3px solid #1B4B8C' }}>
                  <div className="p-4 space-y-3">
                    {[
                      { label: '식사 횟수', value: '2회 (07:30, 18:00)' },
                      { label: '사료 종류', value: '로얄캐닌 미디엄 어덜트' },
                      { label: '급여량', value: '120g', sub: '권장량 130g 대비 92%' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between pb-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                        <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{row.label}</span>
                        <div className="text-right">
                          <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600 }}>{row.value}</span>
                          {row.sub && <p style={{ fontSize: '10px', color: '#9E9E9E' }}>({row.sub})</p>}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '11px', color: '#9E9E9E' }}>총 칼로리</span>
                      <span style={{ fontSize: '18px', color: '#1B4B8C', fontWeight: 700 }}>432 kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '8px', backgroundColor: '#EBEBEB', margin: '0 -20px' }} />

            {/* Water & Bathroom */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>음수량 & 배변 기록</h3>
              <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ border: '1px solid #E0E0E0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #81C784, #4CAF50)', fontSize: '22px' }}>
                  🐕
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>코코</p>
                  <p style={{ fontSize: '10px', color: '#9E9E9E' }}>음수량 350ml · 배변 정상 2회</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <CheckCircle2 size={18} style={{ color: '#4CAF50' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#4CAF50' }}>기록됨</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl p-4" style={{ border: '1px solid #C5D8EE', backgroundColor: '#E8F0FA' }}>
              <div className="flex items-start gap-2">
                <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: '10px', color: '#0D2B5E', lineHeight: '1.6' }}>
                  생활 데이터가 축적될수록 더 정확한 건강 리포트가 생성됩니다. 꾸준한 기록이 반려동물 건강 관리의 핵심이에요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button onClick={handleSubmit} disabled={!walkLogged || submitting}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{
              height: '48px',
              background: walkLogged && !submitting ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0',
              color: 'white', fontSize: '14px', fontWeight: 700,
              cursor: walkLogged && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: walkLogged && !submitting ? '0 4px 16px rgba(27,75,140,0.3)' : 'none'
            }}>
            {submitting ? '저장 중...' : '기록 저장하기 →'}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}