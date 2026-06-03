import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { ChevronRight } from 'lucide-react';
import {
  getReport,
  Report,
  VaccinationCode,
  ReportApiError,
} from '@/app/api/report';

// ── Constants ──────────────────────────────────────────────────────────────────

const VACCINE_CYCLE_DAYS: Record<VaccinationCode, number> = {
  DHPPL: 365,
  RABIES: 365,
  KENNEL_COUGH: 365,
  CORONA_ENTERITIS: 365,
  HEARTWORM: 30,
  PARASITE: 90,
};

const VACCINE_LABELS: Record<VaccinationCode, string> = {
  DHPPL: '종합백신 (DHPPL)',
  RABIES: '광견병',
  KENNEL_COUGH: '켄넬코프',
  CORONA_ENTERITIS: '코로나장염',
  HEARTWORM: '심장사상충',
  PARASITE: '외부기생충',
};

const ALERT_INFO: Record<string, { icon: string; text: string; color: string; bg: string; border: string }> = {
  HEARTWORM_DUE_THIS_MONTH:        { icon: '💊', text: '심장사상충 예방약 투약 시기입니다',     color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  DHPPL_DUE_THIS_MONTH:            { icon: '💉', text: '종합백신 (DHPPL) 접종 시기입니다',      color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  RABIES_DUE_THIS_MONTH:           { icon: '💉', text: '광견병 접종 시기입니다',                color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  KENNEL_COUGH_DUE_THIS_MONTH:     { icon: '💉', text: '켄넬코프 접종 시기입니다',              color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  CORONA_ENTERITIS_DUE_THIS_MONTH: { icon: '💉', text: '코로나장염 접종 시기입니다',            color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  PARASITE_DUE_THIS_MONTH:         { icon: '💊', text: '외부기생충 예방약 투약 시기입니다',     color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  WALK_RECORD_MISSING:             { icon: '🐾', text: '이번 주 산책 기록이 없습니다',          color: '#616161', bg: '#F5F5F5', border: '#E0E0E0' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatMonth(yearMonth: string): string {
  const [, m] = yearMonth.split('-');
  return `${parseInt(m, 10)}월`;
}

function getVaccinationStatus(code: VaccinationCode, lastDate: string) {
  const next = new Date(lastDate);
  next.setDate(next.getDate() + VACCINE_CYCLE_DAYS[code]);
  const daysUntilNext = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysUntilNext > 30) {
    return { status: '접종 완료', detail: `다음 접종까지 ${daysUntilNext}일`, dot: '#4CAF50', textColor: '#2E7D32' };
  }
  if (daysUntilNext > 0) {
    return { status: '이번 달 접종 필요', detail: `다음 접종까지 ${daysUntilNext}일`, dot: '#FFA726', textColor: '#E65100' };
  }
  return { status: '접종 기한 초과', detail: `${Math.abs(daysUntilNext)}일 경과`, dot: '#EF5350', textColor: '#C62828' };
}

function formatWeightChange(delta: number): { label: string; color: string; bg: string } {
  if (delta > 0) return { label: `+${delta}kg`, color: '#F57C00', bg: '#FFF8E1' };
  if (delta < 0) return { label: `${delta}kg`, color: '#1976D2', bg: '#E3F2FD' };
  return { label: '변동 없음', color: '#616161', bg: '#F5F5F5' };
}

// ── Tooltip components ─────────────────────────────────────────────────────────

const VisitTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-2 py-1 rounded-lg" style={{ backgroundColor: '#0D2B5E', color: 'white', fontSize: '11px', fontWeight: 600 }}>
        {payload[0].value}회
      </div>
    );
  }
  return null;
};

const WalkTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-2 py-1 rounded-lg" style={{ backgroundColor: '#0D2B5E', color: 'white', fontSize: '11px', fontWeight: 600 }}>
        {payload[0].value}분
      </div>
    );
  }
  return null;
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function HealthReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const petId = Number(localStorage.getItem('hyfive_petId'));
    if (!petId) {
      setError('활성화된 반려동물을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    getReport(petId)
      .then(setReport)
      .catch((err) => {
        if (err instanceof ReportApiError && err.status === 404) {
          setError('등록된 반려동물이 없습니다.');
        } else {
          setError('리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const reportMonth = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  if (loading) {
    return (
      <MobileFrame>
        <div className="h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#F5F7FC' }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#C5D8EE', borderTopColor: '#1B4B8C' }}
          />
          <p style={{ fontSize: '13px', color: '#9E9E9E', marginTop: '12px' }}>리포트 불러오는 중...</p>
        </div>
      </MobileFrame>
    );
  }

  if (error || !report) {
    return (
      <MobileFrame>
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F5F7FC' }}>
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🐾</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E', textAlign: 'center' }}>
              {error ?? '리포트를 불러올 수 없습니다.'}
            </p>
          </div>
          <BottomNav active="report" />
        </div>
      </MobileFrame>
    );
  }

  const visitData = report.medical.monthlyVisits.map(v => ({
    month: formatMonth(v.month),
    count: v.count,
  }));

  const walkTrendData = report.lifestyle.walkTrend.map((w, i) => ({
    week: `${i + 1}주`,
    minutes: w.minutes,
  }));

  const { latestWeightKg, weightChangeKg, weeklyAverageWalkMinutes } = report.lifestyle;

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Pet profile bar */}
        <div className="flex-shrink-0 bg-white px-5 flex items-center gap-3" style={{ height: '60px', borderBottom: '1px solid #EBEBEB' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}>
            {report.pet.profileImageUrl
              ? <img src={report.pet.profileImageUrl} alt={report.pet.name} className="w-full h-full object-cover" />
              : <span style={{ fontSize: '20px' }}>🐶</span>
            }
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>{report.pet.name}</p>
            <p style={{ fontSize: '11px', color: '#9E9E9E' }}>
              {report.pet.breed}{report.pet.ageYears != null ? ` · 만 ${report.pet.ageYears}세` : ''}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#9E9E9E', textAlign: 'right' }}>건강 리포트</p>
            <p style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 600, textAlign: 'right' }}>{reportMonth}</p>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">

            {/* Section 1: 진료 요약 */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-4 pt-4 pb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>최근 3개월 진료 현황</p>
              </div>

              <div className="px-4 pb-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#E8F0FA' }}>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#1B4B8C' }}>{report.medical.totalVisitCount}회</p>
                  <p style={{ fontSize: '10px', color: '#2E6DB4' }}>진료 횟수</p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div style={{ color: '#1C1C1C' }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart id="visit-bar-chart" data={visitData} barSize={28} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false} tickCount={3} />
                      <Tooltip content={<VisitTooltip />} cursor={{ fill: 'rgba(27,75,140,0.05)' }} />
                      <Bar dataKey="count" name="visit-count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                        {visitData.map((_, index) => (
                          <Cell key={`vc-${index}`} fill={index === visitData.length - 1 ? '#1B4B8C' : '#C5D8EE'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Section 2: 생활 데이터 추이 */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-4 pt-4 pb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>이번 주 생활 기록</p>
              </div>

              <div className="px-4 pb-3">
                {/* Walk */}
                <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🚶</span>
                  <div className="flex-1">
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>산책</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>하루 평균 {weeklyAverageWalkMinutes}분</p>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-3 py-2">
                  <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>⚖️</span>
                  <div className="flex-1">
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>체중</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>
                      {latestWeightKg != null ? `${latestWeightKg} kg` : '기록 없음'}
                    </p>
                  </div>
                  {weightChangeKg != null && (() => {
                    const wc = formatWeightChange(weightChangeKg);
                    return (
                      <span className="px-2 py-1 rounded-full" style={{ backgroundColor: wc.bg, color: wc.color, fontSize: '10px', fontWeight: 600 }}>
                        {wc.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="px-4 pb-4">
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginBottom: '6px' }}>4주 산책 시간 추이 (분)</p>
                <div style={{ color: '#1C1C1C' }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart id="walk-line-chart" data={walkTrendData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<WalkTooltip />} />
                      <Line type="monotone" dataKey="minutes" name="walk-minutes" stroke="#1B4B8C" strokeWidth={2.5} dot={{ fill: '#1B4B8C', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Section 3: 예방접종 현황 */}
            {report.vaccinations.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="px-4 pt-4 pb-2">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>예방접종 현황</p>
                </div>
                <div className="px-4 pb-4">
                  {report.vaccinations.map((v, i) => {
                    const vs = getVaccinationStatus(v.code, v.lastVaccinationDate);
                    return (
                      <div
                        key={v.code}
                        className="flex items-center gap-3 py-3"
                        style={{ borderBottom: i < report.vaccinations.length - 1 ? '1px solid #F5F5F5' : 'none' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: vs.dot }} />
                        <div className="flex-1">
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{VACCINE_LABELS[v.code]}</p>
                          <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{vs.detail}</p>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: vs.textColor }}>{vs.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: 최근 알림 */}
            {report.alerts.length > 0 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>최근 알림</p>
                <div className="space-y-2">
                  {report.alerts.map((alert, i) => {
                    const info = ALERT_INFO[alert.type] ?? {
                      icon: '🔔',
                      text: alert.message,
                      color: '#616161',
                      bg: '#F5F5F5',
                      border: '#E0E0E0',
                    };
                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 flex items-start gap-3"
                        style={{ backgroundColor: info.bg, border: `1px solid ${info.border}` }}
                      >
                        <span style={{ fontSize: '18px', flexShrink: 0 }}>{info.icon}</span>
                        <div className="flex-1">
                          <p style={{ fontSize: '12px', fontWeight: 600, color: info.color }}>{info.text}</p>
                          <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '2px' }}>{alert.detail}</p>
                        </div>
                        <button onClick={() => navigate(alert.actionPath)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <ChevronRight size={16} style={{ color: '#BDBDBD' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ height: '4px' }} />
          </div>
        </div>

        <BottomNav active="report" />
      </div>
    </MobileFrame>
  );
}
