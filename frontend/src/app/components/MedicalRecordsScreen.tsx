import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Hospital, Receipt, Search } from 'lucide-react';

type MedType = '전체' | '진료' | '예방접종' | '수술' | '건강검진' | '기타';

interface MedRecord {
  id: number;
  date: string;
  hospital: string;
  type: Exclude<MedType, '전체'>;
  diagnosis: string;
  items: string;
  amount: string;
  memo?: string;
  prescriptions?: string[];
}

const MOCK_RECORDS: MedRecord[] = [
  {
    id: 1,
    date: '2026-03-26',
    hospital: '하나동물병원',
    type: '진료',
    diagnosis: '아토피성 피부염',
    items: '피부과 진료, 약 처방 (3종)',
    amount: '48,500',
    memo: '가려움증 증상 개선 중. 2주 후 재진 예정.',
    prescriptions: ['덱사메타손 정 5mg (7일분)', '항히스타민제 (14일분)', '외용 연고 (14일분)'],
  },
  {
    id: 2,
    date: '2026-02-10',
    hospital: '서울동물의료센터',
    type: '건강검진',
    diagnosis: '정기 종합검진',
    items: '혈액검사, X-Ray, 심장초음파',
    amount: '156,000',
    memo: '전반적으로 건강 상태 양호. 심장 잡음 없음.',
    prescriptions: [],
  },
  {
    id: 3,
    date: '2026-01-15',
    hospital: '하나동물병원',
    type: '예방접종',
    diagnosis: '종합백신 5종 (DHPPL)',
    items: '예방접종, 심장사상충 예방약 처방',
    amount: '52,000',
    memo: '다음 접종: 2027-01-15',
    prescriptions: ['심장사상충 예방약 넥스가드 (3개월분)'],
  },
  {
    id: 4,
    date: '2025-11-03',
    hospital: '강남동물병원',
    type: '진료',
    diagnosis: '급성 위장염',
    items: '복부 초음파, 수액 처치, 약 처방',
    amount: '87,000',
    memo: '구토 2회 후 내원. 3일 처방 후 회복.',
    prescriptions: ['위장약 (3일분)', '항구토제 (3일분)', '유산균 (7일분)'],
  },
  {
    id: 5,
    date: '2025-08-20',
    hospital: '서울동물의료센터',
    type: '수술',
    diagnosis: '중성화 수술',
    items: '수술 전 혈액검사, 중성화 수술, 마취비',
    amount: '380,000',
    memo: '수술 후 경과 양호. 실밥 제거 완료.',
    prescriptions: ['항생제 (7일분)', '진통제 (5일분)'],
  },
];

const TYPE_COLORS: Record<Exclude<MedType, '전체'>, { bg: string; text: string; border: string }> = {
  '진료':     { bg: '#E8F0FA', text: '#1B4B8C', border: '#C5D8EE' },
  '예방접종': { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  '수술':     { bg: '#FCE4EC', text: '#C62828', border: '#F48FB1' },
  '건강검진': { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8' },
  '기타':     { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
};

const FILTERS: MedType[] = ['전체', '진료', '예방접종', '수술', '건강검진', '기타'];

export default function MedicalRecordsScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MedType>('전체');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = MOCK_RECORDS.filter(r => {
    const matchType = filter === '전체' || r.type === filter;
    const matchSearch = search === '' ||
      r.hospital.includes(search) ||
      r.diagnosis.includes(search) ||
      r.items.includes(search);
    return matchType && matchSearch;
  });

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>진료기록</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 space-y-4 pb-4">

            {/* Summary card */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 60%, #2E6DB4 100%)', boxShadow: '0 6px 20px rgba(13,43,94,0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Hospital size={24} style={{ color: 'white' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>코코의 진료 내역</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: '2px' }}>총 {MOCK_RECORDS.length}건</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search size={16} style={{ color: '#BDBDBD', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="병원명, 진단명으로 검색"
                className="w-full rounded-xl pl-9 pr-4"
                style={{ height: '42px', fontSize: '13px', border: '1.5px solid #E0E0E0', backgroundColor: 'white', color: '#1C1C1C', outline: 'none' }}
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: filter === f ? '#1B4B8C' : 'white',
                    color: filter === f ? 'white' : '#9E9E9E',
                    border: filter === f ? 'none' : '1px solid #E0E0E0',
                    fontSize: '12px',
                    fontWeight: filter === f ? 700 : 400,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Record list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10">
                  <span style={{ fontSize: '36px' }}>📋</span>
                  <p style={{ fontSize: '13px', color: '#9E9E9E', marginTop: '8px' }}>검색 결과가 없어요</p>
                </div>
              ) : filtered.map(record => {
                const tc = TYPE_COLORS[record.type];
                const isOpen = expandedId === record.id;
                return (
                  <div key={record.id} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* Row header */}
                    <button
                      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() => setExpandedId(isOpen ? null : record.id)}
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}` }}>
                        <Receipt size={18} style={{ color: tc.text }} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.text, fontSize: '10px', fontWeight: 700, border: `1px solid ${tc.border}` }}>
                            {record.type}
                          </span>
                          <span style={{ fontSize: '11px', color: '#BDBDBD' }}>{record.date}</span>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1C' }} className="truncate">{record.diagnosis}</p>
                        <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }} className="truncate">{record.hospital} · {record.items}</p>
                      </div>
                      {/* Amount + expand */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B4B8C' }}>{record.amount}원</p>
                        {isOpen
                          ? <ChevronUp size={16} style={{ color: '#BDBDBD' }} />
                          : <ChevronDown size={16} style={{ color: '#BDBDBD' }} />
                        }
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid #F5F5F5', backgroundColor: '#FAFAFA' }}>
                        <div className="px-4 py-3 space-y-3">
                          {/* Details grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: '병원', value: record.hospital },
                              { label: '날짜', value: record.date },
                              { label: '진단', value: record.diagnosis },
                              { label: '금액', value: `${record.amount}원` },
                            ].map(item => (
                              <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: 'white', border: '1px solid #EFEFEF' }}>
                                <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '3px' }}>{item.label}</p>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{item.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Items */}
                          <div className="rounded-xl p-3" style={{ backgroundColor: 'white', border: '1px solid #EFEFEF' }}>
                            <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '4px' }}>진료 항목</p>
                            <p style={{ fontSize: '12px', color: '#1C1C1C' }}>{record.items}</p>
                          </div>

                          {/* Prescriptions */}
                          {record.prescriptions && record.prescriptions.length > 0 && (
                            <div className="rounded-xl p-3" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#1B4B8C', marginBottom: '6px' }}>처방 내역 💊</p>
                              <div className="space-y-1.5">
                                {record.prescriptions.map((rx, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1B4B8C' }} />
                                    <p style={{ fontSize: '11px', color: '#0D2B5E' }}>{rx}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Memo */}
                          {record.memo && (
                            <div className="rounded-xl p-3" style={{ backgroundColor: '#FFFDE7', border: '1px solid #FFF176' }}>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#F9A825', marginBottom: '3px' }}>메모 📝</p>
                              <p style={{ fontSize: '11px', color: '#5D4037', lineHeight: 1.6 }}>{record.memo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload CTA */}
            <button
              onClick={() => navigate('/medical-upload')}
              className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}
            >
              <Plus size={18} />
              새 진료기록 업로드
            </button>

            <div style={{ height: '4px' }} />
          </div>
        </div>

      </div>
    </MobileFrame>
  );
}
