import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import {
  ChevronLeft, ChevronRight, Plus, Minus, Check,
  Weight, AlertCircle, Calendar, Loader2,
} from 'lucide-react';
import {
  createHealthRecord, updateHealthRecord, listHealthRecords, getHealthRecord,
  HealthApiError, HealthNetworkError,
  type BowelStatus, type HealthRecord,
} from '../api/health';

// ── 상수 ──────────────────────────────────────────────────────────────────────

type FecalState = '정상' | '무름' | '딱딱함' | '혈변' | '없음';

const CURRENT_PET_ID = Number(localStorage.getItem('hyfive_petId') ?? '1');

const FECAL_TO_API: Record<FecalState, BowelStatus> = {
  '정상': 'NORMAL', '무름': 'SOFT', '딱딱함': 'HARD', '혈변': 'BLOOD', '없음': 'NONE',
};
const API_TO_FECAL: Record<BowelStatus, FecalState> = {
  NORMAL: '정상', SOFT: '무름', HARD: '딱딱함', BLOOD: '혈변', NONE: '없음',
};

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toErrorMsg(e: unknown, fallback: string): string {
  if (e instanceof HealthNetworkError) return '서버에 연결할 수 없어요. 네트워크를 확인해주세요.';
  if (e instanceof HealthApiError) {
    if (e.status === 401) return '로그인이 만료됐어요. 다시 로그인해주세요.';
    if (e.status === 422) return `입력값 오류: ${e.message}`;
    if (e.status >= 500) return `서버 오류 (${e.status}). 잠시 후 다시 시도해주세요.`;
    return e.message;
  }
  return fallback;
}

// ── 정적 데이터 ───────────────────────────────────────────────────────────────

interface MedItem {
  id: string;
  label: string;
  emoji: string;
  checked: boolean;
  note: string;
}

const defaultMeds: MedItem[] = [
  { id: 'heartworm', label: '심장사상충 예방약', emoji: '💊', checked: false, note: '' },
  { id: 'glucosamine', label: '글루코사민',       emoji: '🦴', checked: false, note: '' },
  { id: 'vitamin',    label: '종합 비타민',        emoji: '✨', checked: false, note: '' },
  { id: 'probiotic',  label: '유산균',             emoji: '🦠', checked: false, note: '' },
];

const fecalOptions: { value: FecalState; emoji: string; color: string }[] = [
  { value: '정상',   emoji: '✅', color: '#2E7D32' },
  { value: '무름',   emoji: '⚠️', color: '#F57C00' },
  { value: '딱딱함', emoji: '🪨', color: '#795548' },
  { value: '혈변',   emoji: '🚨', color: '#B71C1C' },
  { value: '없음',   emoji: '❌', color: '#9E9E9E' },
];

const symptomChips = [
  { id: 'vomit',    label: '구토',     emoji: '🤢' },
  { id: 'cough',    label: '기침',     emoji: '😮‍💨' },
  { id: 'itch',     label: '가려움',   emoji: '🐾' },
  { id: 'appetite', label: '식욕부진', emoji: '🍽️' },
  { id: 'lethargy', label: '기력저하', emoji: '😴' },
  { id: 'limp',     label: '파행',     emoji: '🦵' },
  { id: 'eye',      label: '눈 분비물', emoji: '👁️' },
  { id: 'ear',      label: '귀 긁음',  emoji: '👂' },
];

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];
const TODAY = todayString();

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS_KR[d.getDay()]}요일`;
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function HealthLogScreen() {
  const navigate = useNavigate();

  // 오늘 날짜용 폼 상태 (편집 가능)
  const [weight, setWeight] = useState(0);
  const [fecal, setFecal] = useState<FecalState>('정상');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [meds, setMeds] = useState<MedItem[]>(defaultMeds);

  // 저장 상태
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 조회 상태
  const [loadedRecord, setLoadedRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [dateToRecordId, setDateToRecordId] = useState<Record<string, number>>({});
  const [recordDates, setRecordDates] = useState<Set<string>>(new Set());

  // 캘린더 상태
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  // ── Effect 1: 마운트 시 목록 조회 → 날짜→ID 맵 + 캘린더 dot 구성 ───────────
  useEffect(() => {
    listHealthRecords(CURRENT_PET_ID)
      .then(records => {
        const map: Record<string, number> = {};
        const dates = new Set<string>();
        records.forEach(r => {
          const date = r.createdAt.slice(0, 10);
          map[date] = r.healthRecordId;
          dates.add(date);
        });
        setDateToRecordId(map);
        setRecordDates(dates);
      })
      .catch(() => {
        // 목록 실패는 무시 — 캘린더 dot만 안 보임
      });
  }, []);

  // ── Effect 2: 날짜 변경 시 단건 조회 → 폼 반영 ──────────────────────────────
  useEffect(() => {
    const recordId = dateToRecordId[selectedDate];
    if (recordId === undefined) {
      // 해당 날짜에 기록 없음 → 폼 초기화
      setLoadedRecord(null);
      setLoadError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setSaveError('');

    getHealthRecord(recordId)
      .then(record => {
        if (cancelled) return;
        setLoadedRecord(record);

        // 오늘 날짜면 폼에 기존 값 채우기
        if (selectedDate === TODAY) {
          setWeight(record.weight);
          setFecal(API_TO_FECAL[record.bowelStatus]);
          setMeds(
            defaultMeds.map(m => ({
              ...m,
              checked: record.medications.some(med => med.name === m.label && med.isTaken),
            })),
          );
          setSelectedSymptoms(
            new Set(
              record.symptoms
                .map(s => symptomChips.find(c => c.label === s)?.id)
                .filter((id): id is string => Boolean(id)),
            ),
          );
        }
      })
      .catch(e => {
        if (cancelled) return;
        // 404는 "기록 없음"이므로 조용히 처리
        if (!(e instanceof HealthApiError && e.status === 404)) {
          setLoadError(toErrorMsg(e, '기록을 불러오지 못했어요.'));
        }
        setLoadedRecord(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedDate, dateToRecordId]);

  // ── 파생 값 ───────────────────────────────────────────────────────────────────

  const isToday = selectedDate === TODAY;

  // 오늘: 폼 상태 / 과거: 로드된 레코드
  const displayWeight = isToday ? weight : (loadedRecord?.weight ?? 0);
  const displayFecal: FecalState = isToday
    ? fecal
    : loadedRecord ? API_TO_FECAL[loadedRecord.bowelStatus] : '정상';
  const displayMeds = isToday
    ? meds
    : loadedRecord
      ? defaultMeds.map(m => ({
          ...m,
          checked: loadedRecord.medications.some(med => med.name === m.label && med.isTaken),
        }))
      : defaultMeds;
  const displaySymptoms: Set<string> = isToday
    ? selectedSymptoms
    : loadedRecord
      ? new Set(
          loadedRecord.symptoms
            .map(s => symptomChips.find(c => c.label === s)?.id)
            .filter((id): id is string => Boolean(id)),
        )
      : new Set();

  const completedCount = [weight > 0, meds.some(m => m.checked), true].filter(Boolean).length;

  // ── 핸들러 ────────────────────────────────────────────────────────────────────

  const toggleSymptom = (id: string) => {
    if (!isToday) return;
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleMed = (id: string) => {
    if (!isToday) return;
    setMeds(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');

    const body = {
      petId: CURRENT_PET_ID,
      weight,
      bowelStatus: FECAL_TO_API[fecal],
      medications: meds.map(m => ({ name: m.label, isTaken: m.checked })),
      symptoms: Array.from(selectedSymptoms)
        .map(id => symptomChips.find(c => c.id === id)?.label)
        .filter((v): v is string => Boolean(v)),
    };

    try {
      // loadedRecord가 있으면 수정(PUT), 없으면 신규 등록(POST)
      const result = loadedRecord
        ? await updateHealthRecord(loadedRecord.healthRecordId, body)
        : await createHealthRecord(body);

      setLoadedRecord(result);
      // 신규 등록 후 ID 맵 업데이트 → 이후 저장은 자동으로 PUT 사용
      if (!loadedRecord) {
        setDateToRecordId(prev => ({ ...prev, [TODAY]: result.healthRecordId }));
        setRecordDates(prev => new Set([...prev, TODAY]));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(toErrorMsg(e, '저장에 실패했어요. 다시 시도해주세요.'));
    } finally {
      setSaving(false);
    }
  };

  // ── 캘린더 렌더 ───────────────────────────────────────────────────────────────

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDay   = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const renderCalendar = () => {
    const { year, month } = calMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDay(year, month);
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const goPrev = () => setCalMonth(p => p.month === 1  ? { year: p.year - 1, month: 12 } : { ...p, month: p.month - 1 });
    const goNext = () => setCalMonth(p => p.month === 12 ? { year: p.year + 1, month: 1  } : { ...p, month: p.month + 1 });

    return (
      <div className="bg-white rounded-2xl p-3" style={{ border: '1px solid #E0E0E0' }}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={goPrev} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
            <ChevronLeft size={14} style={{ color: '#666' }} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{year}년 {month}월</span>
          <button onClick={goNext} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
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
            const hasRecord = recordDates.has(dateStr) || dateStr === TODAY;
            const isSelected  = dateStr === selectedDate;
            const isTodayDate = dateStr === TODAY;
            const isFuture    = dateStr > TODAY;
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

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* 헤더 */}
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

          {/* 날짜 + 펫 */}
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

            {/* 캘린더 드롭다운 */}
            {showCalendar && renderCalendar()}

            {/* 로딩 */}
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: '#1B4B8C' }} />
                <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 600 }}>기록을 불러오는 중…</span>
              </div>
            )}

            {/* 조회 오류 */}
            {loadError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <AlertCircle size={14} style={{ color: '#C62828' }} />
                <span style={{ fontSize: '11px', color: '#C62828', fontWeight: 600 }}>{loadError}</span>
              </div>
            )}

            {/* 저장 오류 */}
            {saveError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <AlertCircle size={14} style={{ color: '#C62828' }} />
                <span style={{ fontSize: '11px', color: '#C62828', fontWeight: 600 }}>{saveError}</span>
              </div>
            )}

            {/* 과거 날짜 배너 */}
            {!isToday && !loading && loadedRecord && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F3F0FF', border: '1px solid #D4C9F5' }}>
                <span style={{ fontSize: '11px', color: '#5E35B1', fontWeight: 600 }}>📖 과거 기록 보기 (읽기 전용)</span>
              </div>
            )}
            {!isToday && !loading && !loadedRecord && !loadError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
                <span style={{ fontSize: '11px', color: '#9E9E9E', fontWeight: 600 }}>📋 이 날은 기록이 없어요</span>
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
                  <span style={{ fontSize: '36px', fontWeight: 700, color: '#1B4B8C' }}>
                    {displayWeight > 0 ? displayWeight.toFixed(1) : '-'}
                  </span>
                  {displayWeight > 0 && <span style={{ fontSize: '14px', color: '#9E9E9E', marginLeft: '4px' }}>kg</span>}
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
                      {med.checked
                        ? <Check size={14} style={{ color: 'white' }} />
                        : <span style={{ fontSize: '12px' }}>{med.emoji}</span>}
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
                    <span style={{ fontSize: '9px', fontWeight: 700, color: displayFecal === opt.value ? opt.color : '#BDBDBD', marginTop: '3px' }}>
                      {opt.value}
                    </span>
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
                    ⚠️ {displaySymptoms.size}가지 증상 선택됨. 지속되면 수의사 상담을 권장해요.
                  </p>
                </div>
              )}
            </div>

            {/* 5. 저장 버튼 (오늘만) */}
            {isToday && (
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  height: '52px',
                  background: saved
                    ? 'linear-gradient(135deg, #2E7D32, #388E3C)'
                    : 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(27,75,140,0.35)',
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saved
                  ? <><Check size={18} /> 저장 완료!</>
                  : saving
                    ? <><Loader2 size={16} className="animate-spin" /> 저장 중…</>
                    : loadedRecord
                      ? '✏️ 건강 기록 수정하기'
                      : '❤️ 건강 기록 저장하기'}
              </button>
            )}

            <div style={{ height: '8px' }} />
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

