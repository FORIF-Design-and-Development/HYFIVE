import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Camera, Sparkles, CheckCircle2, Edit3, ChevronDown } from 'lucide-react';

type ScreenState = 'upload' | 'analyzing' | 'result';
type MedicalType = '진료' | '예방접종' | '수술' | '건강검진' | '기타';

const MEDICAL_TYPES: MedicalType[] = ['진료', '예방접종', '수술', '건강검진', '기타'];

const MOCK_OCR = {
  hospital: '하나동물병원',
  date: '2026-03-26',
  items: '피부과 진료, 약 처방 (3종)',
  diagnosis: '아토피성 피부염',
  amount: '48,500',
};

const analyzeSteps = [
  '이미지 전처리 중...',
  '텍스트 인식 (OCR) 중...',
  'AI 항목 분류 중...',
  '진료 데이터 구조화 완료!',
];

export default function MedicalUploadScreen() {
  const navigate = useNavigate();
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [screenState, setScreenState] = useState<ScreenState>('upload');
  const [selectedDate, setSelectedDate] = useState('2026-03-26');
  const [medType, setMedType] = useState<MedicalType>('진료');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [ocrData, setOcrData] = useState(MOCK_OCR);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    };
  }, [receiptPreviewUrl]);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptPreviewUrl(current => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setReceiptFile(file);
  };

  const handleAnalyze = () => {
    setScreenState('analyzing');
    setAnalyzeStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      if (step >= analyzeSteps.length - 1) {
        clearInterval(interval);
        setTimeout(() => setScreenState('result'), 600);
      }
    }, 700);
  };

  const handleSave = () => {
    navigate('/medical-records');
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => screenState === 'upload' ? navigate('/medical-records') : setScreenState('upload')}
            className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>진료 기록 업로드</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        {/* Upload State */}
        {screenState === 'upload' && (
          <div className="flex-1 overflow-y-auto">
            {/* Step Indicator */}
            <div className="bg-white px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['업로드', 'AI 분석', '확인 저장'].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? '#1B4B8C' : '#E0E0E0' }}>
                    <span style={{ fontSize: '9px', color: i === 0 ? 'white' : '#9E9E9E', fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: i === 0 ? '#1B4B8C' : '#9E9E9E', fontWeight: i === 0 ? 700 : 400 }}>{s}</span>
                  {i < 2 && <div style={{ width: '20px', height: '1px', backgroundColor: '#E0E0E0' }} />}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Date */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>진료일</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl px-4"
                  style={{ height: '44px', fontSize: '13px', border: '2px solid #1B4B8C', backgroundColor: '#E8F0FA', color: '#1C1C1C', outline: 'none' }} />
              </div>

              {/* Medical Type */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>진료 유형</label>
                <button onClick={() => setShowTypePicker(v => !v)} className="w-full rounded-xl px-4 flex items-center justify-between"
                  style={{ height: '44px', border: '1.5px solid #E0E0E0', backgroundColor: 'white' }}>
                  <span style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: 600 }}>{medType}</span>
                  <ChevronDown size={18} style={{ color: '#1B4B8C' }} />
                </button>
                {showTypePicker && (
                  <div className="rounded-xl overflow-hidden mt-1" style={{ border: '1.5px solid #E0E0E0', backgroundColor: 'white' }}>
                    {MEDICAL_TYPES.map(t => (
                      <button key={t} onClick={() => { setMedType(t); setShowTypePicker(false); }}
                        className="w-full px-4 py-3 text-left flex items-center justify-between transition-all"
                        style={{ borderBottom: '1px solid #F5F5F5', backgroundColor: medType === t ? '#E8F0FA' : 'white' }}>
                        <span style={{ fontSize: '13px', color: medType === t ? '#1B4B8C' : '#1C1C1C', fontWeight: medType === t ? 700 : 400 }}>{t}</span>
                        {medType === t && <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#1B4B8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Image Upload */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '8px' }}>영수증 이미지</label>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReceiptChange}
                />
                <div className="flex flex-col items-center py-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="rounded-2xl flex items-center justify-center transition-all active:scale-95 overflow-hidden"
                      aria-label="영수증 이미지 업로드"
                      title={receiptFile?.name || '영수증 이미지 업로드'}
                      style={{
                        width: '112px',
                        height: '112px',
                        backgroundColor: receiptPreviewUrl ? 'white' : '#F5F8FE',
                        border: receiptPreviewUrl ? '2px solid #1B4B8C' : '2px dashed #6A9FD4',
                        boxShadow: receiptPreviewUrl ? '0 8px 22px rgba(27,75,140,0.16)' : 'none',
                      }}
                    >
                      {receiptPreviewUrl ? (
                        <img
                          src={receiptPreviewUrl}
                          alt="영수증 미리보기"
                          className="w-full h-full"
                          style={{ objectFit: 'contain', backgroundColor: '#F8FAFD' }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                            <Camera size={20} style={{ color: '#1B4B8C' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700 }}>사진 추가</span>
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
                      aria-label={receiptPreviewUrl ? '영수증 이미지 변경' : '영수증 이미지 추가'}
                      style={{ backgroundColor: '#1B4B8C', border: '3px solid white', boxShadow: '0 4px 12px rgba(27,75,140,0.32)' }}
                    >
                      <Camera size={15} style={{ color: 'white' }} />
                    </button>
                  </div>
                  {receiptFile && (
                    <div className="mt-3 px-3 py-1.5 rounded-full max-w-full" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                      <p className="truncate" style={{ maxWidth: '180px', fontSize: '10px', color: '#1B4B8C', fontWeight: 600 }}>
                        {receiptFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* OCR Info */}
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: '#E8F0FA' }}>
                <Sparkles size={16} style={{ color: '#1B4B8C', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '11px', color: '#0D2B5E', lineHeight: '1.6' }}>
                  <strong>AI OCR 자동 분석</strong>이 영수증에서 진료일, 병원명, 진료 항목, 진단명, 금액을 자동으로 추출합니다. 업로드 후 직접 확인·수정할 수 있어요.
                </p>
              </div>
            </div>

            <div className="px-5 pb-6">
              <button onClick={handleAnalyze} disabled={receiptFile === null}
                className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ height: '50px', background: receiptFile ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0', color: 'white', fontSize: '14px', fontWeight: 700, cursor: receiptFile ? 'pointer' : 'not-allowed', boxShadow: receiptFile ? '0 4px 16px rgba(27,75,140,0.3)' : 'none', border: 'none' }}>
                <Sparkles size={16} />
                AI 자동 분석 시작
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {screenState === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)', boxShadow: '0 8px 32px rgba(27,75,140,0.3)' }}>
              <Sparkles size={36} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2B5E', textAlign: 'center', marginBottom: '6px' }}>AI가 분석 중이에요</h3>
            <p style={{ fontSize: '12px', color: '#9E9E9E', textAlign: 'center', marginBottom: '32px' }}>잠시만 기다려주세요</p>

            <div className="w-full space-y-3">
              {analyzeSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: i <= analyzeStep ? '#E8F0FA' : 'white', border: '1px solid', borderColor: i <= analyzeStep ? '#C5D8EE' : '#F0F0F0' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: i < analyzeStep ? '#4CAF50' : i === analyzeStep ? '#1B4B8C' : '#E0E0E0' }}>
                    {i < analyzeStep
                      ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : i === analyzeStep
                        ? <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'white' }} />
                        : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#BDBDBD' }} />
                    }
                  </div>
                  <span style={{ fontSize: '12px', color: i <= analyzeStep ? '#0D2B5E' : '#BDBDBD', fontWeight: i <= analyzeStep ? 600 : 400 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result State */}
        {screenState === 'result' && (
          <div className="flex-1 overflow-y-auto">
            {/* Step Indicator */}
            <div className="bg-white px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['업로드', 'AI 분석', '확인 저장'].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1B4B8C' }}>
                    {i < 2
                      ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ fontSize: '9px', color: 'white', fontWeight: 700 }}>3</span>
                    }
                  </div>
                  <span style={{ fontSize: '10px', color: '#1B4B8C', fontWeight: 700 }}>{s}</span>
                  {i < 2 && <div style={{ width: '20px', height: '1px', backgroundColor: '#1B4B8C' }} />}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* OCR success banner */}
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                <CheckCircle2 size={20} style={{ color: '#4CAF50', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>AI 분석 완료!</p>
                  <p style={{ fontSize: '10px', color: '#388E3C' }}>영수증에서 진료 정보를 자동 추출했어요. 확인 후 수정해주세요.</p>
                </div>
              </div>

              {/* OCR Result Fields */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}>
                  <Sparkles size={14} style={{ color: 'white' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>AI 자동 추출 결과</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'white', fontWeight: 600 }}>직접 수정 가능</span>
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
                        value={ocrData[field.key as keyof typeof ocrData]}
                        onChange={e => setOcrData({ ...ocrData, [field.key]: e.target.value })}
                        className="w-full rounded-xl px-3"
                        style={{ height: '40px', fontSize: '12px', fontWeight: 600, border: '1.5px solid #C5D8EE', backgroundColor: '#F5F8FE', color: '#0D2B5E', outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image preview */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', marginBottom: '8px' }}>첨부 원본 이미지</p>
                <div className="rounded-xl overflow-hidden flex items-center justify-center" style={{ width: '64px', height: '80px', backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                  {receiptPreviewUrl ? (
                    <img src={receiptPreviewUrl} alt="영수증" className="w-full h-full" style={{ objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '28px' }}>🧾</span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 pb-6 space-y-2">
              <button onClick={handleSave}
                className="w-full rounded-xl transition-all active:scale-[0.98]"
                style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 16px rgba(27,75,140,0.3)', border: 'none' }}>
                진료 기록 저장하기
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
