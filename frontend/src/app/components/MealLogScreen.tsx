import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Calendar, Loader2, AlertCircle } from 'lucide-react';
import {
  checkTodayMeals,
  getMealsByDate,
  uploadMeal,
  MealApiError,
  MealNetworkError,
  type MealApiItem,
} from '../api/meal';

type MealTime = '아침' | '점심' | '저녁';
type FoodType = '건식' | '습식' | '혼합';

interface MealEntry {
  foodType: FoodType;
  amount: number;
  hasLeftover: boolean;
  leftoverAmount: '없음' | '소량' | '절반이상';
  note: string;
  done: boolean;
}

const defaultEntry = (): MealEntry => ({
  foodType: '건식',
  amount: 180,
  hasLeftover: false,
  leftoverAmount: '없음',
  note: '',
  done: false,
});

const mealTimes: MealTime[] = ['아침', '점심', '저녁'];

const mealEmoji: Record<MealTime, string> = {
  아침: '🌅', 점심: '☀️', 저녁: '🌙',
};

const foodTypes: FoodType[] = ['건식', '습식', '혼합'];

const TIME_MAP: Record<MealTime, string> = {
  아침: 'BREAKFAST',
  점심: 'LUNCH',
  저녁: 'DINNER',
};

const TIME_REVERSE_MAP: Record<string, MealTime> = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function apiItemsToEntries(items: MealApiItem[]): Partial<Record<MealTime, MealEntry>> {
  const result: Partial<Record<MealTime, MealEntry>> = {};
  for (const item of items) {
    const mealTime = TIME_REVERSE_MAP[item.time];
    if (!mealTime) continue;
    result[mealTime] = {
      foodType: (item.type as FoodType) || '건식',
      amount: parseInt(item.amount) || 180,
      hasLeftover: item.is_left !== '없음',
      leftoverAmount: (item.is_left as '없음' | '소량' | '절반이상') || '없음',
      note: item.memo ?? '',
      done: true,
    };
  }
  return result;
}

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
  const [today] = useState(getToday);

  const [activeTab, setActiveTab] = useState<MealTime>('아침');
  const [entries, setEntries] = useState<Record<MealTime, MealEntry>>({
    아침: defaultEntry(),
    점심: defaultEntry(),
    저녁: defaultEntry(),
  });
  const [pastEntries, setPastEntries] = useState<Record<MealTime, MealEntry> | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wasUpdate, setWasUpdate] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [datesWithRecords, setDatesWithRecords] = useState<Set<string>>(new Set());

  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const isToday = selectedDate === today;
  const displayEntries = isToday
    ? entries
    : (pastEntries ?? { 아침: defaultEntry(), 점심: defaultEntry(), 저녁: defaultEntry() });
  const entry = displayEntries[activeTab];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError('');
    if (!isToday) setPastEntries(null);

    const loadMeals = async () => {
      try {
        const items = isToday
          ? await checkTodayMeals()
          : await getMealsByDate(selectedDate);

        if (cancelled) return;

        const loaded = apiItemsToEntries(items);

        if (isToday) {
          setEntries(prev => ({
            아침: loaded['아침'] ?? prev['아침'],
            점심: loaded['점심'] ?? prev['점심'],
            저녁: loaded['저녁'] ?? prev['저녁'],
          }));
        } else {
          setPastEntries({
            아침: loaded['아침'] ?? defaultEntry(),
            점심: loaded['점심'] ?? defaultEntry(),
            저녁: loaded['저녁'] ?? defaultEntry(),
          });
        }

        if (items.length > 0) {
          setDatesWithRecords(prev => new Set([...prev, selectedDate]));
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof MealNetworkError) {
          setFetchError('서버에 연결할 수 없어요. 네트워크를 확인해주세요.');
        } else if (e instanceof MealApiError) {
          setFetchError(e.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadMeals();
    return () => { cancelled = true; };
  }, [selectedDate, today, isToday]);

  const update = (patch: Partial<MealEntry>) => {
    if (!isToday) return;
    setEntries(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], ...patch } }));
  };

  const handleSave = () => {
    if (!isToday || saving) return;
    setSaving(true);
    setSaveError('');
    void (async () => {
      try {
        const isNew = await uploadMeal({
          time: TIME_MAP[activeTab],
          type: entry.foodType,
          amount: String(entry.amount),
          is_left: entry.leftoverAmount,
          memo: entry.note,
        });
        update({ done: true });
        setWasUpdate(!isNew);
        setSaved(true);
        setDatesWithRecords(prev => new Set([...prev, today]));
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        if (e instanceof MealNetworkError) {
          setSaveError('서버에 연결할 수 없어요.');
        } else if (e instanceof MealApiError) {
          setSaveError(`저장 실패: ${e.message}`);
        }
      } finally {
        setSaving(false);
      }
    })();
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
            const hasRecord = datesWithRecords.has(dateStr);
            const isSelected = dateStr === selectedDate;
            const isTodayDate = dateStr === today;
            const isFuture = dateStr > today;
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
              {isToday ? `${doneCounts}/3 완료` : '기록 보기'}
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

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: '#E65100' }} />
                <span style={{ fontSize: '12px', color: '#9E9E9E' }}>불러오는 중...</span>
              </div>
            )}

            {/* Fetch error */}
            {!loading && fetchError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <AlertCircle size={14} style={{ color: '#C62828' }} />
                <span style={{ fontSize: '11px', color: '#C62828', fontWeight: 600 }}>{fetchError}</span>
              </div>
            )}

            {/* Past date banner */}
            {!loading && !isToday && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F3F0FF', border: '1px solid #D4C9F5' }}>
                <span style={{ fontSize: '11px', color: '#5E35B1', fontWeight: 600 }}>📖 과거 기록 보기 (읽기 전용)</span>
              </div>
            )}

            {/* Content (탭 + 입력 폼) */}
            {!loading && (
              <>
                {/* Meal time tabs */}
                <div className="grid grid-cols-3 gap-2">
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
                    placeholder="특이사항을 입력하세요 (예: 음수량 500ml)"
                    readOnly={!isToday}
                    className="w-full rounded-xl p-3 resize-none"
                    rows={3}
                    style={{ backgroundColor: '#F8F8F8', border: '1px solid #EBEBEB', fontSize: '12px', color: '#1C1C1C', outline: 'none', cursor: isToday ? 'text' : 'default' }}
                  />
                </div>

                {/* Save error */}
                {saveError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                    <AlertCircle size={14} style={{ color: '#C62828' }} />
                    <span style={{ fontSize: '11px', color: '#C62828', fontWeight: 600 }}>{saveError}</span>
                  </div>
                )}

                {/* Save button (오늘만) */}
                {isToday && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{
                      height: '52px',
                      background: saved
                        ? 'linear-gradient(135deg, #2E7D32, #388E3C)'
                        : 'linear-gradient(135deg, #E65100 0%, #FF6F00 100%)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 700,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(230,81,0,0.35)',
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving
                      ? <><Loader2 size={16} className="animate-spin" /> 저장 중…</>
                      : saved
                        ? <><Check size={18} /> {wasUpdate ? '수정 완료!' : '저장 완료!'}</>
                        : `🍖 ${activeTab} 식사 저장하기`}
                  </button>
                )}

                <div style={{ height: '8px' }} />
              </>
            )}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
