import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

interface Term {
  id: string;
  required: boolean;
  title: string;
  detail: string;
  expandable?: boolean;
}

const TERMS: Term[] = [
  {
    id: 'service',
    required: true,
    title: '서비스 이용약관',
    detail: 'HYFIVE 서비스를 이용하기 위한 기본 약관에 동의합니다. 서비스 이용 규칙, 금지 행위, 책임 범위 등을 포함합니다.',
    expandable: true,
  },
  {
    id: 'privacy',
    required: true,
    title: '개인정보 처리방침',
    detail: '반려동물 건강 관리 서비스 제공을 위해 최소한의 개인정보를 수집합니다. 수집 항목: 이메일, 이름, 반려동물 정보. HYFIVE는 PII를 외부에 판매하지 않습니다.',
    expandable: true,
  },
  {
    id: 'camera',
    required: true,
    title: '카메라 · GPS 권한 허용',
    detail: '영수증 OCR 촬영(카메라), 산책 경로 기록(GPS)에만 사용됩니다. 백그라운드 수집은 하지 않습니다.',
  },
  {
    id: 'marketing',
    required: false,
    title: '마케팅 정보 수신 동의',
    detail: '신규 기능 안내, 반려동물 건강 팁 등 유용한 정보를 이메일/푸시로 받아보실 수 있어요. 언제든지 설정에서 변경 가능합니다.',
  },
  {
    id: 'thirdparty',
    required: false,
    title: '제3자 정보 제공 동의',
    detail: '동물병원 연동 서비스 이용 시 해당 병원에 반려동물 건강 정보를 제공할 수 있습니다. 거부해도 기본 서비스 이용에 제한이 없습니다.',
  },
];

export default function SignupTermsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') ?? 'self';

  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const requiredIds = TERMS.filter(t => t.required).map(t => t.id);
  const allRequired = requiredIds.every(id => agreed[id]);
  const allTerms = TERMS.every(t => agreed[t.id]);

  const toggleAll = () => {
    if (allTerms) {
      setAgreed({});
    } else {
      const all: Record<string, boolean> = {};
      TERMS.forEach(t => { all[t.id] = true; });
      setAgreed(all);
    }
  };

  const toggle = (id: string) => {
    setAgreed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    if (!allRequired) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding/1');
    }, 1000);
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button
            onClick={() => navigate(method === 'google' ? '/signup' : '/signup/self')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#1B4B8C' }}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>약관 동의</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* Logo + Title */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D2B5E, #1B4B8C)', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}
            >
              <img src={lionLogo} alt="HYFIVE" style={{ width: '30px', height: '30px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0D2B5E' }}>HYFIVE 이용 약관</h2>
              <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>
                {method === 'google' ? 'Google 계정으로 가입' : '이메일 회원가입'} · 마지막 단계예요
              </p>
            </div>
          </div>

          {/* All agree */}
          <button
            onClick={toggleAll}
            className="w-full flex items-center gap-4 rounded-2xl p-4 mb-3 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: allTerms ? '#E8F0FA' : 'white',
              border: allTerms ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                backgroundColor: allTerms ? '#1B4B8C' : '#F5F5F5',
                border: allTerms ? 'none' : '2px solid #E0E0E0',
              }}
            >
              {allTerms && (
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <p style={{ fontSize: '14px', fontWeight: 700, color: allTerms ? '#1B4B8C' : '#1C1C1C' }}>전체 동의</p>
              <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>필수 및 선택 약관 모두 동의합니다</p>
            </div>
          </button>

          {/* Individual terms */}
          <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {TERMS.map((term, i) => (
              <div key={term.id} style={{ borderBottom: i < TERMS.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => toggle(term.id)}
                    className="flex-shrink-0"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: agreed[term.id] ? '#1B4B8C' : 'white',
                        border: agreed[term.id] ? '2px solid #1B4B8C' : '2px solid #BDBDBD',
                      }}
                    >
                      {agreed[term.id] && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          backgroundColor: term.required ? '#1B4B8C' : '#F5F5F5',
                          color: term.required ? 'white' : '#9E9E9E',
                        }}
                      >
                        {term.required ? '필수' : '선택'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1C1C' }}>{term.title}</span>
                    </div>
                  </div>
                  {term.expandable && (
                    <button
                      onClick={() => toggleExpand(term.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#BDBDBD' }}
                    >
                      <ChevronRight
                        size={16}
                        style={{
                          transition: 'transform 0.2s',
                          transform: expanded[term.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                  )}
                </div>
                {/* Expanded detail */}
                {expanded[term.id] && (
                  <div
                    className="px-4 pb-3"
                    style={{ backgroundColor: '#F8FAFD' }}
                  >
                    <p style={{ fontSize: '11px', color: '#6E6E6E', lineHeight: 1.7 }}>{term.detail}</p>
                    <button
                      style={{ fontSize: '10px', color: '#1B4B8C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', padding: 0 }}
                    >
                      전문 보기 →
                    </button>
                  </div>
                )}
                {/* Always-visible detail for non-expandable */}
                {!term.expandable && (
                  <div className="px-4 pb-3 pl-12">
                    <p style={{ fontSize: '10px', color: '#9E9E9E', lineHeight: 1.6 }}>{term.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div
            className="rounded-xl p-3 flex gap-3 mb-2"
            style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}
          >
            <span style={{ fontSize: '14px', flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: '10px', color: '#2E6DB4', lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700 }}>HYFIVE는 개인정보 보호를 최우선으로 합니다.</span><br />
              수집된 데이터는 반려동물 건강관리 목적으로만 사용되며, 외부 광고 목적 제3자 제공은 일절 없습니다.
              Figma Make는 PII 수집 또는 민감 데이터 보안을 위한 도구가 아님을 안내드립니다.
            </p>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5 py-4 bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
          <button
            onClick={handleSubmit}
            disabled={!allRequired || loading}
            className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              height: '52px',
              background: allRequired
                ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                : '#E0E0E0',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              cursor: allRequired ? 'pointer' : 'not-allowed',
              boxShadow: allRequired ? '0 4px 16px rgba(27,75,140,0.3)' : 'none',
            }}
          >
            {loading ? (
              '계정 생성 중...'
            ) : (
              <>
                <CheckCircle2 size={18} />
                동의하고 가입 완료
              </>
            )}
          </button>
          {!allRequired && (
            <p style={{ fontSize: '10px', color: '#EF5350', textAlign: 'center', marginTop: '6px' }}>
              필수 항목 {requiredIds.filter(id => !agreed[id]).length}개에 동의가 필요합니다
            </p>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
