import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Camera, Sparkles, CheckCircle2, Edit3, ChevronDown, X, AlertCircle } from 'lucide-react';
import { analyzeMedicalOcr, uploadMedicalRecord, type MedicalTypeEnum } from '../api/medical';

type ScreenState = 'upload' | 'analyzing' | 'result';
type MedicalType = '진료' | '예방접종' | '수술' | '건강검진' | '기타';

const MEDICAL_TYPES: MedicalType[] = ['진료', '예방접종', '수술', '건강검진', '기타'];

const TYPE_MAP: Record<MedicalType, MedicalTypeEnum> = {
  '진료': 'TREATMENT',
  '예방접종': 'VACCINATION',
  '수술': 'SURGERY',
  '건강검진': 'CHECKUP',
  '기타': 'OTHER',
};

const analyzeSteps = [
  '이미지 전처리 중...',
  '텍스트 인식 (OCR) 중...',
  'AI 항목 분류 중...',
  '진료 데이터 구조화 완료!',
];

type OcrData = {
  hospital: string;
  date: string;
  items: string;
  diagnosis: string;
  amount: string;
};

export default function MedicalUploadScreen() {
  const navigate = useNavigate();
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const receiptPreviewUrlsRef = useRef<string[]>([]);

  const [screenState, setScreenState] = useState<ScreenState>('upload');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [medType, setMedType] = useState<MedicalType>('진료');
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptPreviewUrls, setReceiptPreviewUrls] = useState<string[]>([]);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [ocrData, setOcrData] = useState<OcrData>({ hospital: '', date: '', items: '', diagnosis: '', amount: '' });
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [ocrImageUrls, setOcrImageUrls] = useState<string[]>([]);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      receiptPreviewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 3 - receiptFiles.length;
    const added = files.slice(0, remaining);
    const newUrls = added.map(f => URL.createObjectURL(f));
    setReceiptFiles(prev => [...prev, ...added]);
    setReceiptPreviewUrls(prev => {
      const next = [...prev, ...newUrls];
      receiptPreviewUrlsRef.current = next;
      return next;
    });
    e.target.value = '';
  };

  const removeReceipt = (idx: number) => {
    URL.revokeObjectURL(receiptPreviewUrls[idx]);
    setReceiptFiles(prev => prev.filter((_, i) => i !== idx));
    setReceiptPreviewUrls(prev => {
      const next = prev.filter((_, i) => i !== idx);
      receiptPreviewUrlsRef.current = next;
      return next;
    });
  };

  const handleAnalyze = async () => {
    setScreenState('analyzing');
    setAnalyzeStep(0);
    setOcrError(null);

    let localStep = 0;
    const interval = setInterval(() => {
      localStep = Math.min(localStep + 1, analyzeSteps.length - 2);
      setAnalyzeStep(localStep);
    }, 800);

    try {
      const result = await analyzeMedicalOcr(selectedDate, TYPE_MAP[medType], receiptFiles);

      clearInterval(interval);

      const { extracted, imageUrls } = result;
      setOcrImageUrls(imageUrls ?? []);
      setOcrData({
        hospital: extracted.clinicName ?? '',
        date: extracted.visitDate || selectedDate,
        items: extracted.content ?? '',
        diagnosis: extracted.diagnosis ?? '',
        amount: extracted.totalCost ?? '',
      });
    } catch (e) {
      clearInterval(interval);
      setOcrImageUrls([]);
      setOcrData({ hospital: '', date: selectedDate, items: '', diagnosis: '', amount: '' });
      setOcrError(e instanceof Error ? e.message : 'OCR 분석에 실패했습니다. 직접 입력해주세요.');
    }

    setAnalyzeStep(analyzeSteps.length - 1);
    setTimeout(() => setScreenState('result'), 600);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await uploadMedicalRecord({
        type: TYPE_MAP[medType],
        clinicName: ocrData.hospital,
        visitDate: ocrData.date,
        content: ocrData.items,
        diagnosis: ocrData.diagnosis,
        totalCost: ocrData.amount,
        image: ocrImageUrls,
      });
      navigate('/medical-records', { replace: true });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장에 실패했습니다.');
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '32px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => screenState === 'upload' ? navigate(-1) : setScreenState('upload')}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>진료 기록 업로드</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 30%, transparent 100%)', flexShrink: 0 }} />

        {/* Upload State */}
        {screenState === 'upload' && (
          <div className="flex-1 overflow-y-auto">
            {/* Step Indicator */}
            <div className="bg-white px-3 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['업로드', 'AI 분석', '확인 저장'].map((s, i) => (
                <div key={i} className="flex items-center gap-1.3">
                  <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? '#1B4B8C' : '#E0E0E0' }}>
                    <span style={{ fontSize: '9px', color: i === 0 ? 'white' : '#9E9E9E', fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: i === 0 ? '#1B4B8C' : '#9E9E9E', fontWeight: i === 0 ? 700 : 400 }}>{s}</span>
                  {i < 2 && <div style={{ width: '20px', height: '1px', backgroundColor: '#E0E0E0' }} />}
                </div>
              ))}
            </div>

            <div className="px-3 py-4 space-y-4">
              {/* Date */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '3px' }}>진료일</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl px-4"
                  style={{ height: '44px', fontSize: '13px', border: '2px solid #1B4B8C', backgroundColor: '#E8F0FA', color: '#1C1C1C', outline: 'none' }} />
              </div>

              {/* Medical Type */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '3px' }}>진료 유형</label>
                <button onClick={() => setShowTypePicker(v => !v)} className="w-full rounded-xl px-4 flex items-center justify-between"
                  style={{ height: '44px', border: '1.3px solid #E0E0E0', backgroundColor: 'white' }}>
                  <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: 600 }}>{medType}</span>
                  <ChevronDown size={18} style={{ color: '#1B4B8C' }} />
                </button>
                {showTypePicker && (
                  <div className="rounded-xl overflow-hidden mt-1" style={{ border: '1.3px solid #E0E0E0', backgroundColor: 'white' }}>
                    {MEDICAL_TYPES.map(t => (
                      <button key={t} onClick={() => { setMedType(t); setShowTypePicker(false); }}
                        className="w-full px-4 py-3 text-left flex items-center justify-between transition-all"
                        style={{ borderBottom: '1px solid #F3F3F3', backgroundColor: medType === t ? '#E8F0FA' : 'white' }}>
                        <span style={{ fontSize: '13px', color: medType === t ? '#1B4B8C' : '#1C1C1C', fontWeight: medType === t ? 700 : 400 }}>{t}</span>
                        {medType === t && <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6L3 9L10 3" stroke="#1B4B8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C' }}>영수증 이미지</label>
                  <span style={{ fontSize: '10px', color: '#9E9E9E' }}>{receiptFiles.length}/3장</span>
                </div>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleReceiptChange}
                />
                <div className="grid grid-cols-3 gap-2">
                  {receiptPreviewUrls.map((url, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden" style={{ height: '90px', border: '2px solid #1B4B8C', boxShadow: '0 4px 12px rgba(27,73,140,0.12)' }}>
                      <img src={url} alt={`영수증 ${i + 1}`} className="w-full h-full" style={{ objectFit: 'cover' }} />
                      <button
                        onClick={() => removeReceipt(i)}
                        className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#1B4B8C', border: '2px solid white' }}
                      >
                        <X size={9} style={{ color: 'white' }} />
                      </button>
                    </div>
                  ))}
                  {receiptFiles.length < 3 && (
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-93"
                      style={{ height: '90px', backgroundColor: '#F3F8FE', border: '2px dashed #6A9FD4' }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                        <Camera size={18} style={{ color: '#1B4B8C' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#1B4B8C', fontWeight: 700 }}>사진 추가</span>
                    </button>
                  )}
                </div>
              </div>

              {/* OCR Info */}
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: '#E8F0FA' }}>
                <Sparkles size={16} style={{ color: '#1B4B8C', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '11px', color: '#0D2B3E', lineHeight: '1.6' }}>
                  <strong>AI OCR 자동 분석</strong>이 영수증에서 진료일, 병원명, 진료 항목, 진단명, 금액을 자동으로 추출합니다. 업로드 후 직접 확인·수정할 수 있어요.
                </p>
              </div>
            </div>

            <div className="px-3 pb-6">
              <button onClick={handleAnalyze} disabled={receiptFiles.length === 0}
                className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ height: '30px', background: receiptFiles.length > 0 ? 'linear-gradient(133deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0', color: 'white', fontSize: '14px', fontWeight: 700, cursor: receiptFiles.length > 0 ? 'pointer' : 'not-allowed', boxShadow: receiptFiles.length > 0 ? '0 4px 16px rgba(27,73,140,0.3)' : 'none', border: 'none' }}>
                <Sparkles size={16} />
                AI 자동 분석 시작
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {screenState === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(133deg, #1B4B8C, #2E6DB4)', boxShadow: '0 8px 32px rgba(27,73,140,0.3)' }}>
              <Sparkles size={36} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2B3E', textAlign: 'center', marginBottom: '6px' }}>AI가 분석 중이에요</h3>
            <p style={{ fontSize: '12px', color: '#9E9E9E', textAlign: 'center', marginBottom: '32px' }}>잠시만 기다려주세요</p>

            <div className="w-full space-y-3">
              {analyzeSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: i <= analyzeStep ? '#E8F0FA' : 'white', border: '1px solid', borderColor: i <= analyzeStep ? '#C3D8EE' : '#F0F0F0' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: i < analyzeStep ? '#4CAF30' : i === analyzeStep ? '#1B4B8C' : '#E0E0E0' }}>
                    {i < analyzeStep
                      ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L3 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : i === analyzeStep
                        ? <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'white' }} />
                        : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#BDBDBD' }} />
                    }
                  </div>
                  <span style={{ fontSize: '12px', color: i <= analyzeStep ? '#0D2B3E' : '#BDBDBD', fontWeight: i <= analyzeStep ? 600 : 400 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result State */}
        {screenState === 'result' && (
          <div className="flex-1 overflow-y-auto">
            {/* Step Indicator */}
            <div className="bg-white px-3 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['업로드', 'AI 분석', '확인 저장'].map((s, i) => (
                <div key={i} className="flex items-center gap-1.3">
                  <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1B4B8C' }}>
                    {i < 2
                      ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L3 9L10 3" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ fontSize: '9px', color: 'white', fontWeight: 700 }}>3</span>
                    }
                  </div>
                  <span style={{ fontSize: '10px', color: '#1B4B8C', fontWeight: 700 }}>{s}</span>
                  {i < 2 && <div style={{ width: '20px', height: '1px', backgroundColor: '#1B4B8C' }} />}
                </div>
              ))}
            </div>

            <div className="px-3 py-4 space-y-4">
              {/* Banner */}
              {ocrError ? (
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFCC80' }}>
                  <AlertCircle size={20} style={{ color: '#E65100', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#BF360C' }}>OCR 분석 실패</p>
                    <p style={{ fontSize: '10px', color: '#E64A19' }}>{ocrError}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F3E9', border: '1px solid #A3D6A7' }}>
                  <CheckCircle2 size={20} style={{ color: '#4CAF30', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>AI 분석 완료!</p>
                    <p style={{ fontSize: '10px', color: '#388E3C' }}>영수증에서 진료 정보를 자동 추출했어요. 확인 후 수정해주세요.</p>
                  </div>
                </div>
              )}

              {/* OCR Result Fields */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(133deg, #1B4B8C, #2E6DB4)' }}>
                  <Sparkles size={14} style={{ color: 'white' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>AI 자동 추출 결과</span>
                  <span className="ml-auto px-2 py-0.3 rounded-full" style={{ backgroundColor: 'rgba(233,233,233,0.2)', fontSize: '10px', color: 'white', fontWeight: 600 }}>직접 수정 가능</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { key: 'hospital', label: '병원명' },
                    { key: 'date', label: '진료일' },
                    { key: 'items', label: '진료 항목' },
                    { key: 'diagnosis', label: '진단명' },
                    { key: 'amount', label: '진료비 (원)' },
                  ].map(field => (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label style={{ fontSize: '10px', fontWeight: 600, color: '#9E9E9E' }}>{field.label}</label>
                        <Edit3 size={12} style={{ color: '#6A9FD4' }} />
                      </div>
                      <input
                        type={field.key === 'date' ? 'date' : 'text'}
                        value={ocrData[field.key as keyof OcrData]}
                        onChange={e => setOcrData({ ...ocrData, [field.key]: e.target.value })}
                        className="w-full rounded-xl px-3"
                        style={{ height: '40px', fontSize: '12px', fontWeight: 600, border: '1.3px solid #C3D8EE', backgroundColor: '#F3F8FE', color: '#0D2B3E', outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image preview */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', marginBottom: '8px' }}>첨부 원본 이미지</p>
                <div className="flex gap-2 flex-wrap">
                  {receiptPreviewUrls.length > 0 ? receiptPreviewUrls.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden" style={{ width: '64px', height: '80px', border: '1px solid #C3D8EE' }}>
                      <img src={url} alt={`영수증 ${i + 1}`} className="w-full h-full" style={{ objectFit: 'cover' }} />
                    </div>
                  )) : (
                    <div className="rounded-xl flex items-center justify-center" style={{ width: '64px', height: '80px', backgroundColor: '#E8F0FA', border: '1px solid #C3D8EE' }}>
                      <span style={{ fontSize: '28px' }}>🧾</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-3 pb-6 space-y-2">
              {saveError && (
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                  <AlertCircle size={14} style={{ color: '#C62828', flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', color: '#C62828' }}>{saveError}</p>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ height: '30px', background: saving ? '#9E9E9E' : 'linear-gradient(133deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, boxShadow: saving ? 'none' : '0 4px 16px rgba(27,73,140,0.3)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving && <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: 'white' }} />}
                {saving ? '저장 중...' : '진료 기록 저장하기'}
              </button>
              <button onClick={() => setScreenState('upload')} style={{ width: '100%', textAlign: 'center', fontSize: '13px', color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '4px' }}>
                다시 업로드하기
              </button>
            </div>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}

