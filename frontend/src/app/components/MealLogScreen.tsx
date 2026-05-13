import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Calendar } from 'lucide-react';

type MealTime = '아침' | '점심' | '저녁' | '간식';
type FoodType = '건식' | '습식' | '혼합';
type AppetiteLevel = '매우좋음' | '좋음' | '보통' | '부족' | '거부';

interface MealEntry {
  foodType: FoodType;
  amount: number;
  appetite: AppetiteLevel;
  hasLeftover: boolean;
  leftoverAmount: '없음' | '소량' | '절반이상';
  note: string;
  done: boolean;
}

interface DayMealRecord {
  entries: Record<MealTime, MealEntry>;
}

const defaultEntry = (): MealEntry => ({
  foodType: '건식',
  amount: 180,
  appetite: '좋음',
  hasLeftover: false,
  leftoverAmount: '없음',
  note: '',
  done: false,
});

const mealTimes: MealTime[] = ['아침', '점심', '저녁', '간식'];

const mealEmoji: Record<MealTime, string> = {
  아침: '🌅', 점심: '☀️', 저녁: '🌙', 간식: '🦴',
};

const foodTypes: FoodType[] = ['건식', '습식', '혼합'];

const appetiteOptions: { value: AppetiteLevel; label: string; color: string; bg: string }[] = [
  { value: '매우좋음', label: '매우 좋음', color: '#1B5E20', bg: '#E8F5E9' },
  { value: '좋음', label: '좋음', color: '#2E7D32', bg: '#C8E6C9' },
  { value: '보통', label: '보통', color: '#F57C00', bg: '#FFF3E0' },
  { value: '부족', label: '부족', color: '#E65100', bg: '#FBE9E7' },
  { value: '거부', label: '거부', color: '#B71C1C', bg: '#FFEBEE' },
];

const TODAY = '2026-04-02';

const historyData: Record<string, DayMealRecord> = {
  '2026-04-01': {
    entries: {
      아침: { foodType: '건식', amount: 180, appetite: '좋음', hasLeftover: false, leftoverAmount: '없음', note: '', done: true },
      점심: { ...defaultEntry(), done: false },
      저녁: { foodType: '건식', amount: 200, appetite: '보통', hasLeftover: true, leftoverAmount: '소량', note: '', done: true },
      간식: { ...defaultEntry(), done: false },
    },
  },
  '2026-03-31': {
    entries: {
      아침: { foodType: '건식', amount: 180, appetite: '좋음', hasLeftover: false, leftoverAmount: '없음', note: '', done: true },
      점심: { ...defaultEntry(), done: false },
      저녁: { foodType: '건식', amount: 180, appetite: '좋음', hasLeftover: false, leftoverAmount: '없음', note: '', done: true },
      간식: { ...defaultEntry(), done: false },
    },
  },
  '2026-03-30': {
    entries: {
      아침: { foodType: '혼합', amount: 150, appetite: '부족', hasLeftover: true, leftoverAmount: '절반이상', note: '입맛 없어 보임', done: true },
      점심: { ...defaultEntry(), done: false },
      저녁: { foodType: '건식', amount: 200, appetite: '좋음', hasLeftover: false, leftoverAmount: '없음', note: '', done: true },
      간식: { foodType: '건식', amount: 30, appetite: '좋음', hasLeftover: false, leftoverAmount: '없음', note: '', done: true },
    },
  },
};

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAYS_KR[d.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayName}요일`;
}

export default function MealLogScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MealTime>('아침');
  const [entries, setEntries] = useState<Record<MealTime, MealEntry>>({
    아침: { ...defaultEntry(), done: true, amount: 180 },
    점심: { ...defaultEntry(), done: false },
    저녁: { ...defaultEntry(), done: false, amount: 200 },
    간식: { ...defaultEntry(), done: false, amount: 30 },
  });
  const [saved, setSaved] = useState(false);

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState({ year: 2026, month: 4 });

  const isToday = selectedDate === TODAY;
  const pastData = isToday ? null : historyData[selectedDate] ?? null;

  const displayEntries = isToday ? entries : (pastData?.entries ?? entries);
  const entry = displayEntries[activeTab];

  const update = (patch: Partial<MealEntry>) => {
    if (!isToday) return;
    setEntries(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], ...patch } }));
  };

  const handleSave = () => {
    if (!isToday) return;
    update({ done: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const doneCounts = Object.values(displayEntries).filter(e => e.done).length;

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDay = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const renderCalendar = () => {
    const { year, month } = calMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDay(year, month);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => setCalMonth(p => p.month === 1 ? { year: p.year - 1, month: 12 } : { ...p, month: p.month - 1 });
    const nextMonth = () => setCalMonth(p => p.month === 12 ? { year: p.year + 1, month: 1 } : { ...p, month: p.month + 1 });

    return (
      <div className="bg-white rounded-2xl p-3" style={{ border: '1px solid #E0E0E0' }}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
            <ChevronLeft size={14} style={{ color: '#666' }} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{year}년 {month}월</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
            <ChevronRight size={14} style={{ color: '#666' }} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS_KR.map((d, i) => (
            <div key={d} className="text-center" style={{ fontSize: '10px', fontWeight: 600, paddingBottom: '4px', color: i === 0 ? '#E53935' : i === 6 ? '#1565C0' : '#9E9E9E' }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasRecord = dateStr in historyData || dateStr === TODAY;
            const isSelected = dateStr === selectedDate;
            const isTodayDate = dateStr === TODAY;
            const isFuture = dateStr > TODAY;
            const dow = (firstDay + day - 1) % 7;

            return (
              <button
                key={idx}
                disabled={isFuture}
                onClick={() => { setSelectedDate(dateStr); setShowCalendar(false); }}
                className="flex flex-col items-center py-1 rounded-lg"
                style={{
                  backgroundColor: isSelected ? '#E65100' : isTodayDate ? '#FFF3E0' : 'transparent',
                  opacity: isFuture ? 0.3 : 1,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: isSelected || isTodayDate ? 700 : 400,
                  color: isSelected ? 'white' : isTodayDate ? '#E65100' : dow === 0 ? '#E53935' : dow === 6 ? '#1565C0' : '#1C1C1C',
                }}>
                  {day}
                </span>
                {hasRecord && (
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#E65100', marginTop: '1px' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate('/record')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#E65100' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>식사 기록</span>
          </div>
          <div className="px-2 py-1 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
            <span style={{ fontSize: '11px', color: '#E65100', fontWeight: 700 }}>
              {isToday ? `${doneCounts}/4 완료` : '기록 보기'}
            </span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #FF6F00 0%, #FFCC02 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">

          {/* Date + Pet */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="flex items-center gap-1.5"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Calendar size={13} style={{ color: showCalendar ? '#E65100' : '#9E9E9E' }} />
              <span style={{ fontSize: '12px', color: showCalendar ? '#E65100' : '#9E9E9E', fontWeight: showCalendar ? 700 : 400 }}>
                {formatDateLabel(selectedDate)}
              </span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFCC80' }}>
              <span style={{ fontSize: '14px' }}>🐶</span>
              <span style={{ fontSize: '12px', color: '#E65100', fontWeight: 700 }}>코코</span>
            </div>
          </div>

          <div className="px-5 space-y-3 pb-6">

            {/* Calendar dropdown */}
            {showCalendar && renderCalendar()}

            {/* Past date banner */}
            {!isToday && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F3F0FF', border: '1px solid #D4C9F5' }}>
                <span style={{ fontSize: '11px', color: '#5E35B1', fontWeight: 600 }}>📖 과거 기록 보기 (읽기 전용)</span>
              </div>
            )}

            {/* Meal time tabs */}
            <div className="grid grid-cols-4 gap-2">
              {mealTimes.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="rounded-xl py-2.5 flex flex-col items-center gap-1 transition-all"
                  style={{
                    backgroundColor: activeTab === t ? '#E65100' : displayEntries[t].done ? '#FFF3E0' : 'white',
                    border: `1.5px solid ${activeTab === t ? '#E65100' : displayEntries[t].done ? '#FFCC80' : '#E0E0E0'}`,
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{mealEmoji[t]}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: activeTab === t ? 'white' : displayEntries[t].done ? '#E65100' : '#9E9E9E' }}>{t}</span>
                  {displayEntries[t].done && activeTab !== t && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E65100' }}>
                      <Check size={9} style={{ color: 'white' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Food Type */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>사료 종류</p>
              <div className="flex gap-2">
                {foodTypes.map(ft => (
                  <button
                    key={ft}
                    onClick={() => update({ foodType: ft })}
                    className="flex-1 py-2.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: entry.foodType === ft ? '#E65100' : '#F8F8F8',
                      border: `1.5px solid ${entry.foodType === ft ? '#E65100' : '#E0E0E0'}`,
                      color: entry.foodType === ft ? 'white' : '#9E9E9E',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    {ft === '건식' ? '🥜' : ft === '습식' ? '🥫' : '🥗'} {ft}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E' }}>급여량</p>
                <span style={{ fontSize: '11px', color: '#9E9E9E' }}>권장량: 180~220g</span>
              </div>
              <div className="flex items-center gap-4">
                {isToday && (
                  <button
                    onClick={() => update({ amount: Math.max(0, entry.amount - 10) })}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFF3E0', border: '1.5px solid #FFCC80' }}
                  >
                    <Minus size={16} style={{ color: '#E65100' }} />
                  </button>
                )}
                <div className="flex-1 text-center">
                  <span style={{ fontSize: '32px', fontWeight: 700, color: '#E65100' }}>{entry.amount}</span>
                  <span style={{ fontSize: '14px', color: '#9E9E9E', marginLeft: '4px' }}>g</span>
                </div>
                {isToday && (
                  <button
                    onClick={() => update({ amount: entry.amount + 10 })}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E65100' }}
                  >
                    <Plus size={16} style={{ color: 'white' }} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {[100, 150, 180, 200, 250].map(g => (
                  <button
                    key={g}
                    onClick={() => update({ amount: g })}
                    className="flex-1 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: entry.amount === g ? '#E65100' : '#F8F8F8',
                      border: `1px solid ${entry.amount === g ? '#E65100' : '#E0E0E0'}`,
                      color: entry.amount === g ? 'white' : '#9E9E9E',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>

            {/* Appetite */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>식욕 상태</p>
              <div className="flex gap-1.5">
                {appetiteOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update({ appetite: opt.value })}
                    className="flex-1 py-2 rounded-xl"
                    style={{
                      backgroundColor: entry.appetite === opt.value ? opt.color : '#F8F8F8',
                      border: `1.5px solid ${entry.appetite === opt.value ? opt.color : '#E0E0E0'}`,
                      color: entry.appetite === opt.value ? 'white' : '#BDBDBD',
                      fontSize: '9px',
                      fontWeight: 700,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leftover */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>잔량 여부</p>
              <div className="flex gap-2">
                {(['없음', '소량', '절반이상'] as const).map(lv => (
                  <button
                    key={lv}
                    onClick={() => update({ leftoverAmount: lv, hasLeftover: lv !== '없음' })}
                    className="flex-1 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: entry.leftoverAmount === lv ? (lv === '없음' ? '#1B4B8C' : lv === '소량' ? '#F57C00' : '#E65100') : '#F8F8F8',
                      border: `1.5px solid ${entry.leftoverAmount === lv ? (lv === '없음' ? '#1B4B8C' : lv === '소량' ? '#F57C00' : '#E65100') : '#E0E0E0'}`,
                      color: entry.leftoverAmount === lv ? 'white' : '#9E9E9E',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    {lv === '없음' ? '✅ 없음' : lv === '소량' ? '⚠️ 소량' : '❌ 절반이상'}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '8px' }}>메모 (선택)</p>
              <textarea
                value={entry.note}
                onChange={e => update({ note: e.target.value })}
                placeholder="특이사항을 입력하세요 (예: 구토 없음, 속도 빠르게 먹음)"
                readOnly={!isToday}
                className="w-full rounded-xl p-3 resize-none"
                rows={3}
                style={{ backgroundColor: '#F8F8F8', border: '1px solid #EBEBEB', fontSize: '12px', color: '#1C1C1C', outline: 'none', cursor: isToday ? 'text' : 'default' }}
              />
            </div>

            {/* Save button (오늘만) */}
            {isToday && (
              <button
                onClick={handleSave}
                className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  height: '52px',
                  background: saved ? 'linear-gradient(135deg, #2E7D32, #388E3C)' : 'linear-gradient(135deg, #E65100 0%, #FF6F00 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(230,81,0,0.35)',
                }}
              >
                {saved ? <><Check size={18} /> 저장 완료!</> : `🍖 ${activeTab} 식사 저장하기`}
              </button>
            )}

            <div style={{ height: '8px' }} />
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
