import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft } from 'lucide-react';
import type { VaccineCode } from '../context/onboarding';
import { useOnboarding } from '../context/useOnboarding';

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
      {[1, 2, 3].map(s => (
        <div key={s} className="flex-1 rounded-full" style={{ height: '4px', backgroundColor: s <= step ? '#1B4B8C' : '#E8F0FA', transition: 'background-color 0.3s' }} />
      ))}
    </div>
  );
}

interface VaccineItem {
  code: VaccineCode;
  label: string;
  desc: string;
}

const VACCINE_LIST: VaccineItem[] = [
  { code: 'DHPPL', label: '종합백신 (DHPPL)', desc: '마지막 접종 후 12개월 주기' },
  { code: 'RABIES', label: '광견병', desc: '마지막 접종 후 12개월 주기' },
  { code: 'KENNEL_COUGH', label: '켄넬코프 (기관지염)', desc: '마지막 접종 후 12개월 주기' },
  { code: 'CORONA_ENTERITIS', label: '코로나 장염', desc: '마지막 접종 후 12개월 주기' },
  { code: 'HEARTWORM', label: '심장사상충 예방', desc: '매월 1회 투약' },
  { code: 'PARASITE', label: '외부기생충 구제', desc: '분기별 1회' },
];

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl" style={{ border: value ? '1.5px solid #C5D8EE' : '1.5px solid #E0E0E0', backgroundColor: value ? '#F5F8FE' : 'white' }}>
      <div className="flex-1">
        <p style={{ fontSize: '13px', fontWeight: 600, color: value ? '#1B4B8C' : '#1C1C1C' }}>{label}</p>
        {desc && <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>{desc}</p>}
      </div>
      <button
        onClick={onChange}
        className="relative rounded-full transition-all flex-shrink-0"
        style={{ width: '46px', height: '26px', backgroundColor: value ? '#1B4B8C' : '#E0E0E0' }}
      >
        <div className="absolute top-[3px] rounded-full transition-all" style={{
          width: '20px', height: '20px', backgroundColor: 'white',
          left: value ? '23px' : '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease'
        }} />
      </button>
    </div>
  );
}

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const { step2, updateStep2 } = useOnboarding();
  const [vaccines, setVaccines] = useState<Record<VaccineCode, boolean>>(step2.vaccines);
  const [lastCheckup, setLastCheckup] = useState(step2.lastCheckup);
  const [diseases, setDiseases] = useState(step2.diseases);

  const toggle = (code: VaccineCode) => setVaccines(v => ({ ...v, [code]: !v[code] }));

  const completedCount = Object.values(vaccines).filter(Boolean).length;

  const handleNext = () => {
    updateStep2({
      vaccines,
      lastCheckup,
      diseases,
    });
    navigate('/onboarding/3');
  };

  const handlePrevious = () => {
    updateStep2({
      vaccines,
      lastCheckup,
      diseases,
    });
    navigate('/onboarding/1');
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={handlePrevious} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>반려동물 등록</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <ProgressBar step={2} />

        <div className="flex-1 overflow-y-auto px-5">
          <div className="pt-4 pb-2">
            <p style={{ fontSize: '11px', color: '#6A9FD4', fontWeight: 600 }}>STEP 2 / 3</p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2B5E', marginTop: '2px' }}>건강 정보를 입력해주세요</h2>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>정확하지 않아도 괜찮아요. 나중에 수정할 수 있어요</p>
          </div>

          <div className="space-y-4 pt-2 pb-6">
            {/* Vaccination Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C' }}>예방접종 현황</p>
                <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1B4B8C', color: 'white', fontSize: '10px', fontWeight: 700 }}>
                  {completedCount}/{VACCINE_LIST.length} 완료
                </span>
              </div>
              <div className="space-y-2">
                {VACCINE_LIST.map(v => (
                  <ToggleRow
                    key={v.code}
                    label={v.label}
                    desc={v.desc}
                    value={vaccines[v.code]}
                    onChange={() => toggle(v.code)}
                  />
                ))}
              </div>
              <div className="rounded-xl p-3 flex items-start gap-2 mt-2" style={{ backgroundColor: '#E8F0FA' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>ℹ️</span>
                <p style={{ fontSize: '10px', color: '#0D2B5E', lineHeight: '1.5' }}>
                  접종 완료 항목을 켜두면 재접종 예정일을 자동 계산하고, 예정일 전 알림을 드립니다.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#EBEBEB' }} />

            {/* Additional Info */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '10px' }}>추가 정보 (선택)</p>

              {/* Last checkup */}
              <div className="mb-3">
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '5px' }}>최근 건강검진일</label>
                <input
                  type="date"
                  value={lastCheckup}
                  onChange={e => setLastCheckup(e.target.value)}
                  className="w-full rounded-xl px-4"
                  style={{ height: '44px', fontSize: '13px', border: lastCheckup ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: lastCheckup ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
                />
              </div>

              {/* Known diseases */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#9E9E9E', display: 'block', marginBottom: '5px' }}>기존 질병 / 알레르기</label>
                <textarea
                  value={diseases}
                  onChange={e => setDiseases(e.target.value)}
                  placeholder="현재 앓고 있거나 과거 진단받은 질병을 입력해주세요&#10;예: 피부 알레르기, 슬개골 탈구 등"
                  className="w-full rounded-xl px-4 py-3"
                  rows={3}
                  style={{ fontSize: '12px', border: diseases ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: diseases ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                />
              </div>
            </div>

            {/* Hint */}
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: '#FFF8E1' }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: '10px', color: '#F57C00', lineHeight: '1.5' }}>
                입력된 정보는 예방접종 알림 및 건강 리포트 생성에 활용됩니다. 건강검진 기록을 업로드하면 더욱 정확해져요.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '28px', paddingTop: '12px', backgroundColor: '#F8FAFD' }}>
          <button onClick={handleNext}
            className="w-full rounded-xl transition-all active:scale-[0.98]"
            style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(27,75,140,0.3)', marginBottom: '10px' }}>
            다음
          </button>
          <button onClick={handlePrevious} style={{ width: '100%', textAlign: 'center', fontSize: '13px', color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}>
            이전으로
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
