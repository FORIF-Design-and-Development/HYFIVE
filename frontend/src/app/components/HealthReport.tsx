import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const visitData = [
  { id: 'v-1', month: '1월', count: 1 },
  { id: 'v-2', month: '2월', count: 0 },
  { id: 'v-3', month: '3월', count: 3 },
];

const walkTrendData = [
  { week: '1주', minutes: 20 },
  { week: '2주', minutes: 18 },
  { week: '3주', minutes: 28 },
  { week: '4주', minutes: 25 },
];

const preventionItems = [
  { label: '종합백신 (DHPPL)', status: '접종 완료', detail: '다음 접종까지 87일', dot: '#4CAF50', textColor: '#2E7D32' },
  { label: '광견병', status: '접종 완료', detail: '다음 접종까지 201일', dot: '#4CAF50', textColor: '#2E7D32' },
  { label: '심장사상충', status: '이번 달 투약 필요', detail: '마지막 투약 후 32일 경과', dot: '#FFA726', textColor: '#E65100' },
];

const alertItems = [
  { id: 1, icon: '💊', text: '심장사상충 예방약 투약 시기입니다', sub: '마지막 투약 후 32일 경과', color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  { id: 2, icon: '📝', text: '이번 주 산책 기록이 아직 없습니다', sub: '어제 기준 미입력 3일', color: '#616161', bg: '#F5F5F5', border: '#E0E0E0' },
];

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

export default function HealthReport() {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Pet profile bar */}
        <div className="flex-shrink-0 bg-white px-5 flex items-center gap-3" style={{ height: '60px', borderBottom: '1px solid #EBEBEB' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}>
            <span style={{ fontSize: '20px' }}>🐶</span>
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>코코</p>
            <p style={{ fontSize: '11px', color: '#9E9E9E' }}>골든 리트리버 · 만 4세</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#9E9E9E', textAlign: 'right' }}>건강 리포트</p>
            <p style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 600, textAlign: 'right' }}>2026년 3월</p>
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

              {/* Stats row */}
              <div className="flex px-4 pb-3 gap-3">
                <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: '#E8F0FA' }}>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#1B4B8C' }}>4회</p>
                  <p style={{ fontSize: '10px', color: '#2E6DB4' }}>진료 횟수</p>
                </div>
                <div className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#F8FAFD' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1C1C1C', marginBottom: '2px' }}>주요 진료</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E' }}>피부과 <span style={{ color: '#1B4B8C', fontWeight: 700 }}>3회</span></p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E' }}>내과 <span style={{ color: '#1B4B8C', fontWeight: 700 }}>1회</span></p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="px-4 pb-3">
                <div style={{ color: '#1C1C1C' }}>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart id="visit-bar-chart" data={visitData} barSize={28} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false} tickCount={3} />
                    <Tooltip content={<VisitTooltip />} cursor={{ fill: 'rgba(27,75,140,0.05)' }} />
                    <Bar dataKey="count" name="visit-count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                      {visitData.map((_, index) => (
                        <Cell key={`vc-${index}`} fill={index === 2 ? '#1B4B8C' : '#C5D8EE'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>

              {/* Insight */}
              <div className="mx-4 mb-4 rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: '#FFF8E1' }}>
                <AlertTriangle size={14} style={{ color: '#F57C00', flexShrink: 0 }} />
                <p style={{ fontSize: '11px', color: '#E65100' }}>
                  소형견 평균 대비 <span style={{ fontWeight: 700 }}>2.3배 높음</span> · 피부과 방문 증가 추세
                </p>
              </div>
            </div>

            {/* Section 2: 생활 데이터 추이 */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-4 pt-4 pb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>이번 주 생활 기록</p>
              </div>

              {/* Metric rows */}
              <div className="px-4 space-y-3 pb-3">
                {[
                  { label: '산책', value: '하루 평균 25분', compare: '권장 대비 83%', compareColor: '#1B4B8C', compareBg: '#E8F0FA', emoji: '🚶' },
                  { label: '음수량', value: '하루 평균 180ml', compare: '권장 대비 72%', compareColor: '#F57C00', compareBg: '#FFF8E1', emoji: '💧' },
                  { label: '체중', value: '4.2 kg', compare: '지난달 대비 +0.1kg', compareColor: '#FFA726', compareBg: '#FFF8E1', emoji: '⚖️' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < 2 ? '1px solid #F5F5F5' : 'none' }}>
                    <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{m.emoji}</span>
                    <div className="flex-1">
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{m.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{m.value}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full" style={{ backgroundColor: m.compareBg, color: m.compareColor, fontSize: '10px', fontWeight: 600 }}>
                      {m.compare}
                    </span>
                  </div>
                ))}
              </div>

              {/* Line chart */}
              <div className="px-4 pb-4">
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginBottom: '6px' }}>4주 산책 시간 추이 (분)</p>
                <div style={{ color: '#1C1C1C' }}>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart id="walk-line-chart" data={walkTrendData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false} domain={[10, 35]} />
                    <Tooltip content={<WalkTooltip />} />
                    <Line type="monotone" dataKey="minutes" name="walk-minutes" stroke="#1B4B8C" strokeWidth={2.5} dot={{ fill: '#1B4B8C', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Section 3: 예방 현황 */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-4 pt-4 pb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>예방접종 현황</p>
              </div>
              <div className="px-4 pb-4 space-y-0">
                {preventionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < preventionItems.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.dot }} />
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{item.label}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{item.detail}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: item.textColor }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: 최근 알림 */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>최근 알림</p>
              <div className="space-y-2">
                {alertItems.map(alert => (
                  <div key={alert.id} className="rounded-xl p-4 flex items-start gap-3"
                    style={{ backgroundColor: alert.bg, border: `1px solid ${alert.border}` }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{alert.icon}</span>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: alert.color }}>{alert.text}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '2px' }}>{alert.sub}</p>
                    </div>
                    <button onClick={() => navigate('/record')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ChevronRight size={16} style={{ color: '#BDBDBD' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: '4px' }} />
          </div>
        </div>

        <BottomNav active="report" />
      </div>
    </MobileFrame>
  );
}