import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import { ChevronRight, CheckCircle2, Circle, FileText } from 'lucide-react';

const todayLog = {
  meal: { done: true, summary: '아침 180g · 저녁 미기록', completedCount: 1, totalCount: 2 },
  health: { done: false, summary: '체중·음수량 미기록', completedCount: 2, totalCount: 5 },
  walk: { done: true, summary: '오전 산책 28분 · 1.8km', completedCount: 1, totalCount: 1 },
};

const recentAll = [
  { id: 1, date: '오늘', time: '08:20', type: 'meal', icon: '🍖', title: '아침 식사', desc: '로얄캐닌 건식 180g · 식욕 좋음 · 잔량 없음', color: '#E65100', bg: '#FFF3E0' },
  { id: 2, date: '오늘', time: '07:40', type: 'walk', icon: '🐾', title: '산책', desc: '28분 · 1.8km · 칼로리 21kcal', color: '#1B4B8C', bg: '#E8F0FA' },
  { id: 3, date: '어제', time: '21:10', type: 'health', icon: '⚖️', title: '건강 기록', desc: '체중 28.3kg · 음수량 310ml · 컨디션 좋음', color: '#2E7D32', bg: '#E8F5E9' },
  { id: 4, date: '어제', time: '18:30', type: 'meal', icon: '🍖', title: '저녁 식사', desc: '로얄캐닌 건식 200g · 식욕 보통 · 잔량 소량', color: '#E65100', bg: '#FFF3E0' },
];

const cards = [
  {
    id: 'meal',
    emoji: '🍖',
    title: '식사 기록',
    desc: '사료·간식·식욕 상태 기록',
    path: '/record/meal',
    color: '#E65100',
    bg: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
    lightBg: '#FFF3E0',
    border: '#FFCC80',
    log: todayLog.meal,
    unit: '회',
  },
  {
    id: 'health',
    emoji: '❤️',
    title: '건강 기록',
    desc: '체중·음수량·투약·컨디션',
    path: '/record/health',
    color: '#1B4B8C',
    bg: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
    lightBg: '#E8F0FA',
    border: '#C5D8EE',
    log: todayLog.health,
    unit: '항목',
  },
  {
    id: 'walk',
    emoji: '🐾',
    title: '산책 기록',
    desc: 'GPS 경로·시간·칼로리 기록',
    path: '/walk',
    color: '#2E7D32',
    bg: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
    lightBg: '#E8F5E9',
    border: '#A5D6A7',
    log: todayLog.walk,
    unit: '회',
  },
];

export default function RecordHubScreen() {
  const navigate = useNavigate();

  const totalDone = Object.values(todayLog).filter(v => v.done).length;

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white px-5 flex items-center justify-between" style={{ height: '52px', borderBottom: '1px solid #EBEBEB' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#9E9E9E' }}>2026년 4월 2일 목요일</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>코코의 생활 기록 📋</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#E8F0FA' }}>
            <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700 }}>오늘 {totalDone}/3 완료</span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">

            {/* Today progress */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>오늘 기록 현황</p>
                <span style={{ fontSize: '11px', color: '#9E9E9E' }}>4월 2일</span>
              </div>
              <div className="flex gap-2">
                {cards.map(card => (
                  <div key={card.id} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: card.log.done ? card.lightBg : '#F8F8F8', border: `1px solid ${card.log.done ? card.border : '#E8E8E8'}` }}>
                    <span style={{ fontSize: '20px' }}>{card.emoji}</span>
                    <p style={{ fontSize: '9px', color: card.log.done ? card.color : '#9E9E9E', fontWeight: 700, marginTop: '4px' }}>{card.title.replace(' 기록', '')}</p>
                    {card.log.done
                      ? <CheckCircle2 size={14} style={{ color: card.color, margin: '4px auto 0' }} />
                      : <Circle size={14} style={{ color: '#BDBDBD', margin: '4px auto 0' }} />
                    }
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: '10px', color: '#9E9E9E' }}>전체 달성률</span>
                  <span style={{ fontSize: '10px', color: '#1B4B8C', fontWeight: 700 }}>{Math.round((totalDone / 3) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(totalDone / 3) * 100}%`, background: 'linear-gradient(90deg, #1B4B8C, #6A9FD4)' }} />
                </div>
              </div>
            </div>

            {/* Record Cards */}
            <div className="space-y-3">
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>카테고리별 기록</p>
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => navigate(card.path)}
                  className="w-full rounded-2xl overflow-hidden transition-all active:scale-[0.98] text-left"
                  style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.08)' }}
                >
                  <div className="flex items-center px-4 py-3" style={{ background: card.bg }}>
                    <span style={{ fontSize: '28px', marginRight: '12px' }}>{card.emoji}</span>
                    <div className="flex-1">
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{card.title}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '1px' }}>{card.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.log.done
                        ? <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.25)', fontSize: '10px', color: 'white', fontWeight: 700 }}>완료 ✓</span>
                        : <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>미기록</span>
                      }
                      <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'white', borderLeft: `3px solid ${card.color}` }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600 }}>오늘: {card.log.summary}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>
                        {card.log.completedCount}/{card.log.totalCount} {card.unit} 기록됨
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: card.log.totalCount }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < card.log.completedCount ? card.color : '#E0E0E0' }} />
                      ))}
                    </div>
                  </div>
                </button>
              ))}

              {/* 진료기록 카드 */}
              <button
                onClick={() => navigate('/medical-records')}
                className="w-full rounded-2xl overflow-hidden transition-all active:scale-[0.98] text-left"
                style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center px-4 py-3" style={{ background: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)' }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>🏥</span>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>진료기록</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '1px' }}>병원 영수증 · 처방 · 진단 내역</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'white', fontWeight: 700 }}>5건</span>
                    <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'white', borderLeft: '3px solid #6A1B9A' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: 600 }}>최근: 하나동물병원 · 아토피성 피부염</p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>2026-03-26 · 48,500원</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} style={{ color: '#6A1B9A' }} />
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Log */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>최근 기록</p>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {recentAll.map((item, i) => (
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < recentAll.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.bg }}>
                      <span style={{ fontSize: '15px' }}>{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C' }}>{item.title}</span>
                        <span style={{ fontSize: '9px', color: '#BDBDBD' }}>{item.date} {item.time}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: '4px' }} />
          </div>
        </div>

        <BottomNav active="record" />
      </div>
    </MobileFrame>
  );
}