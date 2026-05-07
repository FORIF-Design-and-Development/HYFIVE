import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { CheckCircle2, Edit3 } from 'lucide-react';

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
      {[1, 2, 3].map(s => (
        <div key={s} className="flex-1 rounded-full" style={{ height: '4px', backgroundColor: s <= step ? '#1B4B8C' : '#E8F0FA' }} />
      ))}
    </div>
  );
}

const summaryItems = [
  { label: '동물 유형', value: '강아지 🐶' },
  { label: '이름', value: '코코' },
  { label: '품종', value: '골든 리트리버' },
  { label: '나이', value: '만 4세 (2021년생)' },
  { label: '체중', value: '28.5 kg' },
  { label: '성별', value: '수컷 · 중성화 완료' },
];

const vaccineItems = [
  { label: '종합백신 (DHPPL)', status: '완료', ok: true },
  { label: '광견병', status: '완료', ok: true },
  { label: '심장사상충', status: '미완료', ok: false },
];

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>반려동물 등록</span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 100%)', flexShrink: 0 }} />

        <ProgressBar step={3} />

        <div className="flex-1 overflow-y-auto px-5">
          {/* Success Header */}
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', boxShadow: '0 8px 24px rgba(27,75,140,0.3)' }}>
                <span style={{ fontSize: '40px' }}>🐶</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4CAF50', border: '2px solid white' }}>
                <CheckCircle2 size={16} style={{ color: 'white' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2B5E', textAlign: 'center', lineHeight: 1.3 }}>
              코코 등록이<br />완료되었어요!
            </h2>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px', textAlign: 'center' }}>
              입력 정보를 확인하고 홈으로 이동해주세요
            </p>
          </div>

          {/* STEP label */}
          <div className="mb-3">
            <p style={{ fontSize: '11px', color: '#6A9FD4', fontWeight: 600 }}>STEP 3 / 3 · 등록 완료</p>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>기본 정보</p>
              <button onClick={() => navigate('/onboarding/1')} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={12} style={{ color: 'white' }} />
                <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>수정</span>
              </button>
            </div>
            <div className="p-4 space-y-0">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < summaryItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccine Card */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #2E6DB4 0%, #6A9FD4 100%)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>예방접종 현황</p>
              <button onClick={() => navigate('/onboarding/2')} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Edit3 size={12} style={{ color: 'white' }} />
                <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>수정</span>
              </button>
            </div>
            <div className="p-4 space-y-0">
              {vaccineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < vaccineItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: item.ok ? '#2E7D32' : '#F57C00' }}>
                    {item.ok ? '✓ ' : '⚠ '}{item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What's next */}
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '8px' }}>다음으로 할 수 있는 것들</p>
            <div className="space-y-2">
              {[
                { emoji: '📋', text: '진료 영수증 업로드 → AI 자동 분석' },
                { emoji: '🚶', text: '오늘의 산책·식사·음수량 기록' },
                { emoji: '📊', text: '데이터 축적 후 건강 리포트 확인' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                  <p style={{ fontSize: '11px', color: '#0D2B5E' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '28px', paddingTop: '12px', backgroundColor: '#F8FAFD' }}>
          <button onClick={() => { setConfirmed(true); navigate('/home'); }}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
            {confirmed ? '이동 중...' : '홈으로 이동 →'}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
