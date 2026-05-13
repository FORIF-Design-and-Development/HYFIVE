import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Weight, AlertCircle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

type FecalState = '정상' | '무름' | '딱딱함' | '혈변' | '없음';

interface MedItem {
  id: string;
  label: string;
  emoji: string;
  checked: boolean;
  note: string;
}

interface DayRecord {
  weight: number;
  fecal: FecalState;
  checkedMeds: string[];
  symptoms: string[];
}

const defaultMeds: MedItem[] = [
  { id: 'heartworm', label: '심장사상충 예방약', emoji: '💊', checked: false, note: '' },
  { id: 'glucosamine', label: '글루코사민', emoji: '🦴', checked: true, note: '1정 급여' },
  { id: 'vitamin', label: '종합 비타민', emoji: '✨', checked: false, note: '' },
  { id: 'probiotic', label: '유산균', emoji: '🦠', checked: false, note: '' },
];

const historyData: Record<string, DayRecord> = {
  '2026-04-01': { weight: 28.3, fecal: '정상', checkedMeds: ['glucosamine'], symptoms: [] },
  '2026-03-31': { weight: 28.4, fecal: '무름', checkedMeds: ['glucosamine', 'heartworm'], symptoms: ['cough'] },
  '2026-03-30': { weight: 28.3, fecal: '정상', checkedMeds: ['glucosamine'], symptoms: [] },
  '2026-03-29': { weight: 28.2, fecal: '정상', checkedMeds: ['glucosamine', 'vitamin'], symptoms: [] },
  '2026-03-28': { weight: 28.1, fecal: '딱딱함', checkedMeds: ['glucosamine'], symptoms: ['appetite'] },
};

const TODAY = '2026-04-02';

const fecalOptions: { value: FecalState; emoji: string; color: string }[] = [
  { value: '정상', emoji: '✅', color: '#2E7D32' },
  { value: '무름', emoji: '⚠️', color: '#F57C00' },
  { value: '딱딱함', emoji: '🪨', color: '#795548' },
  { value: '혈변', emoji: '🚨', color: '#B71C1C' },
  { value: '없음', emoji: '❌', color: '#9E9E9E' },
];

const symptomChips = [
  { id: 'vomit', label: '구토', emoji: '🤢' },
  { id: 'cough', label: '기침', emoji: '😮‍💨' },
  { id: 'itch', label: '가려움', emoji: '🐾' },
  { id: 'appetite', label: '식욕부진', emoji: '🍽️' },
  { id: 'lethargy', label: '기력저하', emoji: '😴' },
  { id: 'limp', label: '跛行', emoji: '🦵' },
  { id: 'eye', label: '눈 분비물', emoji: '👁️' },
  { id: 'ear', label: '귀 긁음', emoji: '👂' },
];

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = DAYS_KR[d.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayName}요일`;
}

export default function HealthLogScreen() {
  const navigate = useNavigate();

  const [weight, setWeight] = useState(28.3);
  const [fecal, setFecal] = useState<FecalState>('정상');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [meds, setMeds] = useState<MedItem[]>(defaultMeds);
  const [saved, setSaved] = useState(false);

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState({ year: 2026, month: 4 });

  const isToday = selectedDate === TODAY;
  const pastData = isToday ? null : historyData[selectedDate] ?? null;

  const displayWeight = isToday ? weight : (pastData?.weight ?? weight);
  const displayFecal: FecalState = isToday ? fecal : (pastData?.fecal ?? '없음');
  const displayMeds = isToday ? meds : defaultMeds.map(m => ({
    ...m,
    checked: pastData?.checkedMeds.includes(m.id) ?? false,
  }));
  const displaySymptoms: Set<string> = isToday
    ? selectedSymptoms
    : new Set(pastData?.symptoms ?? []);

  const getPrevWeight = () => {
    if (isToday) return historyData['2026-04-01']?.weight ?? null;
    const sortedDates = Object.keys(historyData).sort();
    const idx = sortedDates.indexOf(selectedDate);
    return idx > 0 ? historyData[sortedDates[idx - 1]]?.weight ?? null : null;
  };
  const prevWeight = getPrevWeight();
  const weightDiff = prevWeight !== null ? parseFloat((displayWeight - prevWeight).toFixed(2)) : 0;
  const weightTrend = weightDiff > 0.15 ? 'up' : weightDiff < -0.15 ? 'down' : 'stable';
  const trendConfig = {
    up:     { label: '증가', bg: '#FFF3E0', color: '#E65100', Icon: TrendingUp },
    down:   { label: '감소', bg: '#E3F2FD', color: '#1565C0', Icon: TrendingDown },
    stable: { label: '유지', bg: '#E8F5E9', color: '#2E7D32', Icon: Minus },
  }[weightTrend];

  const toggleSymptom = (id: string) => {
    if (!isToday) return;
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMed = (id: string) => {
    if (!isToday) return;
    setMeds(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const completedCount = [
    true,
    meds.some(m => m.checked),
    fecal !== null,
  ].filter(Boolean).length;

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
                  backgroundColor: isSelected ? '#1B4B8C' : isTodayDate ? '#E8F0FA' : 'transparent',
                  opacity: isFuture ? 0.3 : 1,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: isSelected || isTodayDate ? 700 : 400,
                  color: isSelected ? 'white' : isTodayDate ? '#1B4B8C' : dow === 0 ? '#E53935' : dow === 6 ? '#1565C0' : '#1C1C1C',
                }}>
                  {day}
                </span>
                {hasRecord && (
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#1B4B8C', marginTop: '1px' }} />
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
          <button onClick={() => navigate('/record')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>건강 기록</span>
          </div>
          <div className="px-2 py-1 rounded-lg" style={{ backgroundColor: '#E8F0FA' }}>
            <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700 }}>
              {isToday ? `${completedCount}/3 항목` : '기록 보기'}
            </span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">

          {/* Date + Pet */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="flex items-center gap-1.5"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Calendar size={13} style={{ color: showCalendar ? '#1B4B8C' : '#9E9E9E' }} />
              <span style={{ fontSize: '12px', color: showCalendar ? '#1B4B8C' : '#9E9E9E', fontWeight: showCalendar ? 700 : 400 }}>
                {formatDateLabel(selectedDate)}
              </span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
              <span style={{ fontSize: '14px' }}>🐶</span>
              <span style={{ fontSize: '12px', color: '#1B4B8C', fontWeight: 700 }}>코코</span>
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

            {/* 1. 체중 */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                  <Weight size={14} style={{ color: '#1B4B8C' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>체중</p>
              </div>
              <div className="flex items-center gap-4">
                {isToday && (
                  <button
                    onClick={() => setWeight(w => Math.max(0, parseFloat((w - 0.1).toFixed(1))))}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#E8F0FA', border: '1.5px solid #C5D8EE' }}
                  >
                    <Minus size={16} style={{ color: '#1B4B8C' }} />
                  </button>
                )}
                <div className="flex-1 text-center">
                  <span style={{ fontSize: '36px', fontWeight: 700, color: '#1B4B8C' }}>{displayWeight.toFixed(1)}</span>
                  <span style={{ fontSize: '14px', color: '#9E9E9E', marginLeft: '4px' }}>kg</span>
                </div>
                {isToday && (
                  <button
                    onClick={() => setWeight(w => parseFloat((w + 0.1).toFixed(1)))}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#1B4B8C' }}
                  >
                    <Plus size={16} style={{ color: 'white' }} />
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: trendConfig.bg }}>
                <div className="flex items-center gap-2">
                  <trendConfig.Icon size={15} style={{ color: trendConfig.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: trendConfig.color }}>{trendConfig.label}</span>
                  {prevWeight !== null && (
                    <span style={{ fontSize: '11px', color: trendConfig.color, opacity: 0.75 }}>
                      ({weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg)
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: '#9E9E9E' }}>전날 대비</span>
              </div>
            </div>

            {/* 2. 투약/영양제 */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>💊 투약 · 영양제</p>
              <div className="space-y-2">
                {displayMeds.map(med => (
                  <button
                    key={med.id}
                    onClick={() => toggleMed(med.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: med.checked ? '#E8F5E9' : '#F8F8F8',
                      border: `1.5px solid ${med.checked ? '#A5D6A7' : '#E0E0E0'}`,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: med.checked ? '#4CAF50' : '#E0E0E0' }}>
                      {med.checked ? <Check size={14} style={{ color: 'white' }} /> : <span style={{ fontSize: '12px' }}>{med.emoji}</span>}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: med.checked ? '#2E7D32' : '#9E9E9E' }}>{med.label}</p>
                      {med.note && <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{med.note}</p>}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: med.checked ? '#2E7D32' : '#BDBDBD' }}>
                      {med.checked ? '급여완료' : '미급여'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 배변 상태 */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>🚽 배변 상태</p>
              <div className="grid grid-cols-5 gap-2">
                {fecalOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => isToday && setFecal(opt.value)}
                    className="flex flex-col items-center py-2.5 rounded-xl"
                    style={{
                      backgroundColor: displayFecal === opt.value ? '#F0F9FF' : '#F8F8F8',
                      border: `2px solid ${displayFecal === opt.value ? opt.color : '#E0E0E0'}`,
                      cursor: isToday ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: displayFecal === opt.value ? opt.color : '#BDBDBD', marginTop: '3px' }}>{opt.value}</span>
                  </button>
                ))}
              </div>
              {displayFecal === '혈변' && (
                <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#FFEBEE' }}>
                  <AlertCircle size={12} style={{ color: '#B71C1C' }} />
                  <span style={{ fontSize: '10px', color: '#B71C1C', fontWeight: 600 }}>혈변이 지속되면 즉시 동물병원 방문을 권장합니다</span>
                </div>
              )}
            </div>

            {/* 4. 특이증상 */}
            <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>⚠️ 특이증상 (해당 항목 선택)</p>
              <div className="flex flex-wrap gap-2">
                {symptomChips.map(chip => {
                  const selected = displaySymptoms.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      onClick={() => toggleSymptom(chip.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: selected ? '#FFEBEE' : '#F8F8F8',
                        border: `1.5px solid ${selected ? '#EF9A9A' : '#E0E0E0'}`,
                        color: selected ? '#B71C1C' : '#9E9E9E',
                        fontSize: '11px',
                        fontWeight: selected ? 700 : 400,
                        cursor: isToday ? 'pointer' : 'default',
                      }}
                    >
                      {chip.emoji} {chip.label}
                    </button>
                  );
                })}
              </div>
              {displaySymptoms.size > 0 && (
                <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                  <p style={{ fontSize: '10px', color: '#E65100' }}>
                    ⚠️ {displaySymptoms.size}가지 증상이 선택되었습니다. 증상이 지속되면 수의사 상담을 권장해요.
                  </p>
                </div>
              )}
            </div>

            {/* 5. 저장 (오늘만) */}
            {isToday && (
              <button
                onClick={handleSave}
                className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  height: '52px',
                  background: saved ? 'linear-gradient(135deg, #2E7D32, #388E3C)' : 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(27,75,140,0.35)',
                }}
              >
                {saved ? <><Check size={18} /> 저장 완료!</> : '❤️ 건강 기록 저장하기'}
              </button>
            )}

            <div style={{ height: '8px' }} />
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
