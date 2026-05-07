import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { CheckCircle2, Lock, ChevronRight, TrendingUp } from 'lucide-react';

const walkHistory = [
  { month: '10월', amount: 160 },
  { month: '11월', amount: 195 },
  { month: '12월', amount: 175 },
  { month: '1월', amount: 210 },
  { month: '2월', amount: 230 },
  { month: '3월', amount: 200, isCurrent: true },
];

const recentNotifications = [
  { id: 1, label: '종합백신 접종 후 12개월이 경과했습니다', date: '03.10' },
  { id: 2, label: '이번 주 생활 기록 입력 완료', date: '03.12' },
  { id: 3, label: '산책 주간 목표 달성 (주 5회)', date: '03.18' },
  { id: 4, label: '진료 기록 업로드 완료', date: '03.24' },
  { id: 5, label: '건강검진 후 6개월이 경과했습니다', date: '03.24' },
];

const pendingLogs = [
  { id: 6, label: '오늘 음수량 기록하기', desc: '권장 350ml' },
  { id: 7, label: '체중 측정 기록하기', desc: '주 1회 권장' },
  { id: 8, label: '영양제 급여 기록하기', desc: '글루코사민 1정' },
];

const healthStats = [
  { label: '이번 주 산책 달성률', rate: 85, color: '#1B4B8C', bg: '#E8F0FA' },
  { label: '식사 규칙성', rate: 92, color: '#2E6DB4', bg: '#E3EDF8' },
  { label: '음수량 권장 충족률', rate: 78, color: '#6A9FD4', bg: '#EEF5FC' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#0D2B5E', color: 'white', fontSize: '11px', fontWeight: 600 }}>
        {payload[0].value}분
      </div>
    );
  }
  return null;
};

export default function Screen6PremiumChange() {
  const navigate = useNavigate();
  const diffRate = Math.round(((200 - 175) / 175) * 100);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="건강 데이터 추이" />

        <div className="flex-1 overflow-y-auto">

          {/* Hero Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' }} className="px-5 py-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} style={{ color: 'rgba(255,255,255,0.9)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>이번 달 생활 기록 요약</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>이번 주 산책 시간</p>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'white', lineHeight: 1 }}>3시간 20분</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '1px' }}>저번 주 대비</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>+{diffRate}%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>저번 주</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>2시간 55분</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>→</span>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)' }}>이번 주</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>3시간 20분</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">

            {/* Health Stats */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>생활 데이터 요약</h3>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: '11px', color: '#9E9E9E' }}>이번 달 총 산책 시간</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>200분</span>
                </div>
                {healthStats.map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: item.bg, color: item.color, fontSize: '10px', fontWeight: 700 }}>{item.rate}%</span>
                      <span style={{ fontSize: '11px', color: '#1C1C1C' }}>{item.label}</span>
                    </div>
                    <div className="w-20 h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.rate}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-4" style={{ backgroundColor: '#E8F0FA' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B4B8C' }}>소형견 평균 대비 산책</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#1B4B8C' }}>+8%</span>
                </div>
              </div>
            </div>

            {/* Walk Trend Chart */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>산책 시간 추이</h3>
              <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={walkHistory} barSize={28} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}분`} domain={[100, 280]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,75,140,0.05)' }} />
                    <Bar dataKey="amount" name="walk-amount" radius={[5, 5, 0, 0]} isAnimationActive={false}>
                      {walkHistory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#1B4B8C' : '#C5D8EE'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '9px', color: '#BDBDBD', textAlign: 'center', marginTop: '4px' }}>최근 6개월 월별 산책 시간 (단위: 분)</p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '8px', backgroundColor: '#EBEBEB', margin: '0 -20px' }} />

            {/* Recent Notifications */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>최근 알림</h3>
                <span className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#1B4B8C', color: 'white', fontSize: '11px', fontWeight: 700 }}>{recentNotifications.length}건</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {recentNotifications.map((noti, i) => (
                  <div key={noti.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < recentNotifications.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <CheckCircle2 size={18} style={{ color: '#4CAF50', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '11px', color: '#1C1C1C', fontWeight: 600 }}>{noti.label}</span>
                    <span style={{ fontSize: '10px', color: '#9E9E9E' }}>{noti.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Logs */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>오늘 아직 안 한 기록</h3>
                <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 600 }}>{pendingLogs.length}건 남음</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {pendingLogs.map((log, i) => (
                  <button key={log.id} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:bg-gray-50"
                    style={{ borderBottom: i < pendingLogs.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#E0E0E0' }} />
                    <div className="flex-1">
                      <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 500 }}>{log.label}</span>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{log.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F5F5', color: '#9E9E9E', fontSize: '10px', fontWeight: 600 }}>기록하기</span>
                      <ChevronRight size={14} style={{ color: '#BDBDBD' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Next reminder */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B4B8C' }}>
                  <span style={{ fontSize: '14px' }}>📅</span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '4px' }}>다음 종합백신 예정: 2026.04.01</p>
                  <p style={{ fontSize: '10px', color: '#2E6DB4', lineHeight: '1.5' }}>
                    기록을 꾸준히 이어가면 <strong>더 정확한 건강 리포트</strong>를 확인할 수 있어요.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 flex items-start gap-2" style={{ backgroundColor: '#F8F8F8' }}>
              <Lock size={14} style={{ color: '#9E9E9E', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '10px', color: '#9E9E9E', lineHeight: '1.6' }}>
                생활 데이터는 매일 누적 저장됩니다. 데이터가 쌓일수록 팩트 기반 건강 리포트가 더욱 풍부해집니다.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <div className="flex gap-3">
            <button onClick={() => navigate('/report')} className="flex-shrink-0 rounded-xl transition-all active:scale-[0.98]"
              style={{ height: '48px', paddingLeft: '16px', paddingRight: '16px', backgroundColor: 'white', border: '2px solid #1B4B8C', color: '#1B4B8C', fontSize: '12px', fontWeight: 700 }}>
              건강 리포트
            </button>
            <button onClick={() => navigate('/home')} className="flex-1 rounded-xl transition-all active:scale-[0.98]"
              style={{ height: '48px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
              홈으로 →
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}