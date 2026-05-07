import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { CheckCircle2, Circle, ChevronRight, Flame, Star } from 'lucide-react';

type Tab = '오늘' | '이번주' | '완료';

interface RecordItem {
  id: number;
  category: string;
  emoji: string;
  title: string;
  desc: string;
  streak: number;
  impact: number;
  done: boolean;
  tab: Tab | '완료';
}

const INITIAL_RECORDS: RecordItem[] = [
  // 오늘
  { id: 1, category: '운동', emoji: '🐾', title: '산책 기록하기', desc: '오늘 산책 45분 완료', streak: 20, impact: 2, done: true, tab: '오늘' },
  { id: 2, category: '영양', emoji: '🥗', title: '식사 기록하기', desc: '오늘의 급여량을 입력해 주세요', streak: 15, impact: 1, done: false, tab: '오늘' },
  { id: 3, category: '건강', emoji: '💧', title: '음수량 기록하기', desc: '권장 350ml 기록', streak: 10, impact: 1, done: false, tab: '오늘' },
  { id: 4, category: '관리', emoji: '🚿', title: '배변 상태 확인', desc: '오늘 배변 횟수·상태 입력', streak: 10, impact: 1, done: false, tab: '오늘' },
  // 이번주
  { id: 5, category: '건강', emoji: '🏥', title: '진료 기록 업로드', desc: 'OCR로 영수증 자동 분석', streak: 50, impact: 5, done: false, tab: '이번주' },
  { id: 6, category: '건강', emoji: '💉', title: '예방접종 현황 확인', desc: '종합백신 접종 예정 확인', streak: 40, impact: 4, done: false, tab: '이번주' },
  { id: 7, category: '운동', emoji: '⚖️', title: '체중 측정 기록', desc: '주 1회 체중을 기록하세요', streak: 20, impact: 2, done: true, tab: '이번주' },
  // 완료
  { id: 8, category: '건강', emoji: '💉', title: '심장사상충 예방 기록', desc: '2025.10.15 완료', streak: 80, impact: 8, done: true, tab: '완료' },
  { id: 9, category: '운동', emoji: '🐾', title: '이번달 산책 목표 달성', desc: '30회 산책 달성!', streak: 100, impact: 10, done: true, tab: '완료' },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  '운동': { bg: '#E3F2FD', text: '#1565C0' },
  '영양': { bg: '#F1F8E9', text: '#33691E' },
  '건강': { bg: '#FCE4EC', text: '#C62828' },
  '관리': { bg: '#FFF3E0', text: '#E65100' },
};

export default function ScreenMission() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('오늘');
  const [records, setRecords] = useState<RecordItem[]>(INITIAL_RECORDS);

  const todayRecords = records.filter(r => r.tab === '오늘');
  const todayDone = todayRecords.filter(r => r.done).length;
  const todayTotal = todayRecords.length;
  const todayProgress = Math.round((todayDone / todayTotal) * 100);

  const totalStreak = records.filter(r => r.done).reduce((acc, r) => acc + r.streak, 0);
  const totalImpact = records.filter(r => r.done).reduce((acc, r) => acc + r.impact, 0);

  const visibleRecords = records.filter(r =>
    activeTab === '완료' ? r.tab === '완료' && r.done : r.tab === activeTab
  );

  const toggleRecord = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <NavHeader title="홈" />

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2 space-y-4">

            {/* Today Summary Card */}
            <div className="rounded-2xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)',
              boxShadow: '0 6px 20px rgba(0,150,136,0.28)'
            }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginBottom: '3px' }}>
                      오늘의 기록 현황
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
                      {todayDone}<span style={{ fontSize: '14px', fontWeight: 400 }}> / {todayTotal}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <span style={{ fontSize: '26px' }}>🐶</span>
                    </div>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.75)' }}>코코</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${todayProgress}%`, backgroundColor: 'white' }}
                  />
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '5px' }}>
                  {todayProgress}% 완료
                </p>

                {/* Stats Row */}
                <div className="flex gap-3 mt-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <Star size={12} style={{ color: '#FFD54F' }} />
                    <span style={{ fontSize: '11px', color: 'white', fontWeight: 700 }}>{totalStreak}P</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>연속 기록</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <Flame size={12} style={{ color: '#FF8A65' }} />
                    <span style={{ fontSize: '11px', color: 'white', fontWeight: 700 }}>리포트 +{totalImpact}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>정확도</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#F5F5F5' }}>
              {(['오늘', '이번주', '완료'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 rounded-lg transition-all"
                  style={{
                    height: '34px',
                    fontSize: '12px',
                    fontWeight: activeTab === tab ? 700 : 400,
                    backgroundColor: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#009688' : '#9E9E9E',
                    boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Record List */}
            <div className="space-y-2.5">
              {visibleRecords.map((record) => {
                const catStyle = categoryColors[record.category] || { bg: '#F5F5F5', text: '#9E9E9E' };
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-2xl overflow-hidden transition-all"
                    style={{
                      border: record.done ? '1px solid #E0E0E0' : '1.5px solid #E0E0E0',
                      opacity: activeTab === '완료' ? 0.85 : 1
                    }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {/* Emoji Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                        backgroundColor: record.done ? '#F5F5F5' : catStyle.bg
                      }}>
                        <span style={{ fontSize: '20px', filter: record.done ? 'grayscale(60%)' : 'none' }}>
                          {record.emoji}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="px-2 py-0.5 rounded-full"
                            style={{ fontSize: '9px', fontWeight: 700, backgroundColor: catStyle.bg, color: catStyle.text }}
                          >
                            {record.category}
                          </span>
                          <span style={{ fontSize: '10px', color: '#009688', fontWeight: 600 }}>
                            +{record.streak}P
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px', fontWeight: 700, color: record.done ? '#BDBDBD' : '#1C1C1C',
                          textDecoration: record.done ? 'line-through' : 'none',
                          marginBottom: '1px'
                        }}>
                          {record.title}
                        </p>
                        <p style={{ fontSize: '10px', color: '#9E9E9E' }}>
                          {record.desc}
                        </p>
                      </div>

                      {/* Toggle */}
                      {activeTab !== '완료' ? (
                        <button
                          onClick={() => toggleRecord(record.id)}
                          className="flex-shrink-0 transition-all active:scale-90"
                        >
                          {record.done
                            ? <CheckCircle2 size={26} style={{ color: '#009688' }} />
                            : <Circle size={26} style={{ color: '#E0E0E0' }} />
                          }
                        </button>
                      ) : (
                        <CheckCircle2 size={22} style={{ color: '#BDBDBD', flexShrink: 0 }} />
                      )}
                    </div>

                    {/* Impact bar - only undone today records */}
                    {!record.done && activeTab === '오늘' && (
                      <div className="mx-4 mb-3 flex items-center gap-2">
                        <span style={{ fontSize: '9px', color: '#9E9E9E' }}>리포트 기여</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                          <div className="h-full rounded-full" style={{ width: `${record.impact * 10}%`, backgroundColor: '#00BFA5' }} />
                        </div>
                        <span style={{ fontSize: '9px', color: '#009688', fontWeight: 700 }}>+{record.impact}점</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info Card */}
            {activeTab === '오늘' && (
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{
                border: '1px solid #E0E0E0', backgroundColor: 'white'
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1C1C1C', marginBottom: '3px' }}>
                    꾸준한 기록이 핵심이에요!
                  </p>
                  <p style={{ fontSize: '10px', color: '#9E9E9E', lineHeight: 1.6 }}>
                    데이터가 쌓일수록 팩트 기반 건강 리포트가 풍부해집니다. 오늘의 기록을 완성해 보세요.
                    주간 기록률 <span style={{ color: '#009688', fontWeight: 700 }}>80% 이상</span> 달성 시 리포트 정확도가 높아져요.
                  </p>
                </div>
              </div>
            )}

            <div style={{ height: '8px' }} />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5" style={{ paddingBottom: '32px', paddingTop: '12px' }}>
          <button
            onClick={() => navigate('/h-score')}
            className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              height: '48px',
              background: 'linear-gradient(135deg, #009688 0%, #00BFA5 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,150,136,0.3)'
            }}
          >
            <span>건강 리포트 보기</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
