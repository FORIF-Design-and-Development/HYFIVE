import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronDown, ChevronUp, Plus, Hospital, Receipt, Search } from 'lucide-react';
import { getMedicalRecords, type MedicalRecordApi } from '../api/medical';
import type { MedicalRecord, MedicalRecordType } from '../context/medicalRecords';

type MedFilter = '전체' | MedicalRecordType;

const TYPE_COLORS: Record<MedicalRecordType, { bg: string; text: string; border: string }> = {
  '진료': { bg: '#E8F0FA', text: '#1B4B8C', border: '#C5D8EE' },
  '예방접종': { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  '수술': { bg: '#FCE4EC', text: '#C62828', border: '#F48FB1' },
  '건강검진': { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8' },
  '기타': { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
};

const TYPE_REVERSE_MAP: Record<string, MedicalRecordType> = {
  TREATMENT: '진료',
  VACCINATION: '예방접종',
  SURGERY: '수술',
  CHECKUP: '건강검진',
  OTHER: '기타',
};

const FILTERS: MedFilter[] = ['전체', '진료', '예방접종', '수술', '건강검진', '기타'];

type EditableKey = 'hospital' | 'date' | 'diagnosis' | 'amount';

function apiToUiRecord(api: MedicalRecordApi): MedicalRecord {
  return {
    id: api.medicalRecordId,
    date: api.visitDate,
    hospital: api.clinicName,
    type: TYPE_REVERSE_MAP[api.type] ?? '기타',
    diagnosis: api.diagnosis,
    items: api.content,
    amount: String(api.totalCost),
    memo: '',
    prescriptions: api.prescriptions.map(p =>
      p.period ? `${p.content} (${p.period})` : p.content,
    ),
    attachments: api.imageUrls ?? [],
  };
}

export default function MedicalRecordsScreen() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MedFilter>('전체');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [editDraft, setEditDraft] = useState<Partial<MedicalRecord>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    getMedicalRecords()
      .then(apiRecords => {
        if (cancelled) return;
        setRecords(apiRecords.map(apiToUiRecord));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : '불러오기 실패');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const updateRecord = (id: number, patch: Partial<MedicalRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const filtered = records.filter((record) => {
    const matchType = filter === '전체' || record.type === filter;
    const matchSearch = search === '' ||
      record.hospital.includes(search) ||
      record.diagnosis.includes(search) ||
      record.items.includes(search);
    return matchType && matchSearch;
  });

  const startEdit = (record: MedicalRecord) => {
    setEditingId(record.id);
    setEditDraft({
      hospital: record.hospital,
      date: record.date,
      diagnosis: record.diagnosis,
      amount: record.amount,
      items: record.items,
      memo: record.memo,
      prescriptions: record.prescriptions,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = (id: number) => {
    updateRecord(id, {
      hospital: String(editDraft.hospital ?? ''),
      date: String(editDraft.date ?? ''),
      diagnosis: String(editDraft.diagnosis ?? ''),
      amount: String(editDraft.amount ?? ''),
      items: String(editDraft.items ?? ''),
      memo: String(editDraft.memo ?? ''),
      prescriptions: Array.isArray(editDraft.prescriptions) ? editDraft.prescriptions : [],
    });
    cancelEdit();
  };

  const updateDraft = (key: EditableKey, value: string) => {
    setEditDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>
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
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 60%, #2E6DB4 100%)', boxShadow: '0 6px 20px rgba(13,43,94,0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Hospital size={24} style={{ color: 'white' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>코코의 진료 내역</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: '2px' }}>총 {records.length}건</p>
              </div>
            </div>

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

            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {FILTERS.map(filterItem => (
                <button
                  key={filterItem}
                  onClick={() => setFilter(filterItem)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: filter === filterItem ? '#1B4B8C' : 'white',
                    color: filter === filterItem ? 'white' : '#9E9E9E',
                    border: filter === filterItem ? 'none' : '1px solid #E0E0E0',
                    fontSize: '12px',
                    fontWeight: filter === filterItem ? 700 : 400,
                  }}
                >
                  {filterItem}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0' }}>
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: '#C5D8EE', borderTopColor: '#1B4B8C' }} />
                  <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '10px' }}>불러오는 중...</p>
                </div>
              ) : fetchError ? (
                <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0' }}>
                  <span style={{ fontSize: '36px' }}>⚠️</span>
                  <p style={{ fontSize: '13px', color: '#C62828', fontWeight: 700, marginTop: '8px' }}>불러오기 실패</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>{fetchError}</p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setFetchError(null);
                      getMedicalRecords()
                        .then(r => { setRecords(r.map(apiToUiRecord)); setLoading(false); })
                        .catch(e => { setFetchError(e instanceof Error ? e.message : '오류 발생'); setLoading(false); });
                    }}
                    className="mt-3 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE', fontSize: '12px', fontWeight: 700, color: '#1B4B8C' }}
                  >
                    다시 시도
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0' }}>
                  <span style={{ fontSize: '36px' }}>📋</span>
                  <p style={{ fontSize: '13px', color: '#1B4B8C', fontWeight: 700, marginTop: '8px' }}>아직 저장된 진료기록이 없어요</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>새 진료기록 업로드로 첫 기록을 추가해보세요</p>
                </div>
              ) : filtered.map(record => {
                const typeColor = TYPE_COLORS[record.type];
                const isOpen = expandedId === record.id;
                const isEditing = editingId === record.id;
                const detailFields: { label: string; key: EditableKey; value: string }[] = [
                  { label: '병원', key: 'hospital', value: record.hospital },
                  { label: '날짜', key: 'date', value: record.date },
                  { label: '진단', key: 'diagnosis', value: record.diagnosis },
                  { label: '금액', key: 'amount', value: record.amount },
                ];

                return (
                  <div key={record.id} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <button
                      className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() => setExpandedId(isOpen ? null : record.id)}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: typeColor.bg, border: `1px solid ${typeColor.border}` }}>
                        <Receipt size={18} style={{ color: typeColor.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: typeColor.bg, color: typeColor.text, fontSize: '10px', fontWeight: 700, border: `1px solid ${typeColor.border}` }}>
                            {record.type}
                          </span>
                          <span style={{ fontSize: '11px', color: '#BDBDBD' }}>{record.date}</span>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1C' }} className="truncate">{record.diagnosis}</p>
                        <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }} className="truncate">{record.hospital} · {record.items}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B4B8C' }}>{record.amount}원</p>
                        {isOpen
                          ? <ChevronUp size={16} style={{ color: '#BDBDBD' }} />
                          : <ChevronDown size={16} style={{ color: '#BDBDBD' }} />
                        }
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid #F5F5F5', backgroundColor: '#FAFAFA' }}>
                        <div className="px-4 py-3 space-y-3">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-2 rounded-xl"
                                  style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', fontSize: '11px', fontWeight: 700, color: '#9E9E9E' }}
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => saveEdit(record.id)}
                                  className="px-3 py-2 rounded-xl"
                                  style={{ backgroundColor: '#1B4B8C', border: '1px solid #1B4B8C', fontSize: '11px', fontWeight: 700, color: 'white' }}
                                >
                                  저장
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(record)}
                                className="px-3 py-2 rounded-xl"
                                style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE', fontSize: '11px', fontWeight: 700, color: '#1B4B8C' }}
                              >
                                수정
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {detailFields.map(field => (
                              <div key={field.key} className="rounded-xl p-3" style={{ backgroundColor: 'white', border: '1px solid #EFEFEF' }}>
                                <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '3px' }}>{field.label}</p>
                                {isEditing ? (
                                  <input
                                    type={field.key === 'date' ? 'date' : 'text'}
                                    value={String(editDraft[field.key] ?? '')}
                                    onChange={(event) => updateDraft(field.key, event.target.value)}
                                    className="w-full rounded-lg px-3"
                                    style={{ height: '34px', fontSize: '12px', border: '1px solid #C5D8EE', outline: 'none' }}
                                  />
                                ) : (
                                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>
                                    {field.key === 'amount' ? `${field.value}원` : field.value}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl p-3" style={{ backgroundColor: 'white', border: '1px solid #EFEFEF' }}>
                            <p style={{ fontSize: '10px', color: '#9E9E9E', marginBottom: '4px' }}>진료 항목</p>
                            {isEditing ? (
                              <textarea
                                value={String(editDraft.items ?? '')}
                                onChange={(event) => setEditDraft((current) => ({ ...current, items: event.target.value }))}
                                className="w-full rounded-lg px-3 py-2"
                                rows={2}
                                style={{ fontSize: '12px', border: '1px solid #C5D8EE', outline: 'none', resize: 'none' }}
                              />
                            ) : (
                              <p style={{ fontSize: '12px', color: '#1C1C1C' }}>{record.items}</p>
                            )}
                          </div>

                          <div className="rounded-xl p-3" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#1B4B8C', marginBottom: '6px' }}>처방 내역</p>
                            {isEditing ? (
                              <textarea
                                value={(Array.isArray(editDraft.prescriptions) ? editDraft.prescriptions : []).join('\n')}
                                onChange={(event) => setEditDraft((current) => ({ ...current, prescriptions: event.target.value.split('\n').filter(Boolean) }))}
                                className="w-full rounded-lg px-3 py-2"
                                rows={3}
                                style={{ fontSize: '11px', border: '1px solid #C5D8EE', outline: 'none', resize: 'none' }}
                              />
                            ) : record.prescriptions.length > 0 ? (
                              <div className="space-y-1.5">
                                {record.prescriptions.map((prescription, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1B4B8C' }} />
                                    <p style={{ fontSize: '11px', color: '#0D2B5E' }}>{prescription}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '11px', color: '#6A9FD4' }}>처방 내역이 없어요</p>
                            )}
                          </div>

                          {(record.memo || isEditing) && (
                            <div className="rounded-xl p-3" style={{ backgroundColor: '#FFFDE7', border: '1px solid #FFF176' }}>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#F9A825', marginBottom: '3px' }}>메모</p>
                              {isEditing ? (
                                <textarea
                                  value={String(editDraft.memo ?? '')}
                                  onChange={(event) => setEditDraft((current) => ({ ...current, memo: event.target.value }))}
                                  className="w-full rounded-lg px-3 py-2"
                                  rows={3}
                                  style={{ fontSize: '11px', border: '1px solid #FFF176', outline: 'none', resize: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }}
                                />
                              ) : (
                                <p style={{ fontSize: '11px', color: '#5D4037', lineHeight: 1.6 }}>{record.memo}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
