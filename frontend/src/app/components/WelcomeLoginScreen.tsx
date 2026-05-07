import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronRight, PlusCircle, Dog } from 'lucide-react';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

type Phase = 'welcome' | 'first_login_check' | 'new_profile_check';

export default function WelcomeLoginScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('welcome');

  // Simulated existing profiles
  const existingPets = [
    { id: 1, name: '코코', breed: '골든 리트리버', emoji: '🐶', age: '만 4세' },
    { id: 2, name: '나비', breed: '코리안 숏헤어', emoji: '🐱', age: '만 2세' },
  ];

  const handleContinue = () => setPhase('first_login_check');

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto flex flex-col px-5 py-6">

          {/* ──────────── PHASE: WELCOME ──────────── */}
          {phase === 'welcome' && (
            <div className="flex flex-col items-center flex-1">
              {/* Logo */}
              <div className="flex flex-col items-center mt-4 mb-8">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 60%, #2E6DB4 100%)',
                    boxShadow: '0 12px 40px rgba(27,75,140,0.4)',
                  }}
                >
                  <img
                    src={lionLogo}
                    alt="HYFIVE"
                    style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: '#0D2B5E',
                    letterSpacing: '6px',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  HYFIVE
                </h1>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px' }}>AI 반려동물 건강 통합 관리</p>
              </div>

              {/* Welcome message */}
              <div
                className="w-full rounded-2xl p-5 mb-6"
                style={{
                  background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 100%)',
                  boxShadow: '0 6px 24px rgba(13,43,94,0.3)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}
                  >
                    <span style={{ fontSize: '22px' }}>👋</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>환영해요, 김보호자님!</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      로그인에 성공했어요
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  반려동물의 건강을 AI로 스마트하게 관리해보세요.
                  진료기록부터 생활 데이터까지 한 곳에서 확인할 수 있어요. 🐾
                </p>
              </div>

              {/* Features summary */}
              <div className="w-full space-y-2 mb-8">
                {[
                  { emoji: '🤖', text: 'OCR로 영수증을 찍으면 진료기록 자동 정리' },
                  { emoji: '📊', text: '산책·식사·음수량 기반 팩트 건강 리포트' },
                  { emoji: '💊', text: '예방접종·투약 일정 알림 자동화' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: 'white', border: '1px solid #E8E8E8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{f.emoji}</span>
                    <p style={{ fontSize: '12px', color: '#1C1C1C', fontWeight: 500 }}>{f.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto w-full">
                <button
                  onClick={handleContinue}
                  className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: '54px',
                    background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(27,75,140,0.35)',
                  }}
                >
                  시작하기
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ──────────── PHASE: FIRST LOGIN CHECK ──────────── */}
          {phase === 'first_login_check' && (
            <div className="flex flex-col flex-1">
              <div className="mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #E8F0FA 0%, #C5D8EE 100%)', border: '1.5px solid #C5D8EE' }}
                >
                  <Dog size={28} style={{ color: '#1B4B8C' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0D2B5E', lineHeight: 1.3 }}>
                  처음 이용하시나요?
                </h2>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px', lineHeight: 1.7 }}>
                  HYFIVE를 시작하려면 반려동물 정보를 먼저 등록해야 해요.
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {/* YES — First time */}
                <button
                  onClick={() => navigate('/onboarding/1')}
                  className="w-full rounded-2xl p-5 text-left flex items-start gap-4 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                    boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <PlusCircle size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                      예, 처음이에요
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                      반려동물 등록부터 시작할게요.<br />간단한 3단계로 완료할 수 있어요 ✅
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0, marginTop: '2px' }} />
                </button>

                {/* NO — Returning user */}
                <button
                  onClick={() => setPhase('new_profile_check')}
                  className="w-full rounded-2xl p-5 text-left flex items-start gap-4 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'white',
                    border: '1.5px solid #C5D8EE',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#E8F0FA' }}
                  >
                    <span style={{ fontSize: '24px' }}>🔄</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: '#0D2B5E', marginBottom: '4px' }}>
                      아니요, 기존 계정이에요
                    </p>
                    <p style={{ fontSize: '11px', color: '#9E9E9E', lineHeight: 1.6 }}>
                      이전에 등록한 반려동물 정보를<br />불러올게요
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: '#BDBDBD', flexShrink: 0, marginTop: '2px' }} />
                </button>
              </div>
            </div>
          )}

          {/* ──────────── PHASE: NEW PROFILE CHECK ──────────── */}
          {phase === 'new_profile_check' && (
            <div className="flex flex-col flex-1">
              <div className="mb-5">
                <button
                  onClick={() => setPhase('first_login_check')}
                  className="flex items-center gap-1 mb-4"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B4B8C', padding: 0 }}
                >
                  <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>뒤로</span>
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0D2B5E', lineHeight: 1.3 }}>
                  기존 프로필이에요 🐾
                </h2>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px' }}>
                  등록된 반려동물 프로필이에요. 새로운 반려동물을 추가하거나 홈으로 이동할 수 있어요.
                </p>
              </div>

              {/* Existing profiles */}
              <div className="space-y-2 mb-4">
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9E9E9E', marginBottom: '6px' }}>등록된 반려동물</p>
                {existingPets.map(pet => (
                  <div
                    key={pet.id}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #E8F0FA, #C5D8EE)', border: '1px solid #C5D8EE' }}
                    >
                      <span style={{ fontSize: '22px' }}>{pet.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1C1C' }}>{pet.name}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{pet.breed} · {pet.age}</p>
                    </div>
                    <div
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#E8F0FA' }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#1B4B8C' }}>등록됨</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mt-auto">
                {/* YES — register new profile */}
                <button
                  onClick={() => navigate('/onboarding/1')}
                  className="w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'white',
                    border: '1.5px solid #C5D8EE',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #E8F0FA 0%, #C5D8EE 100%)' }}
                  >
                    <PlusCircle size={22} style={{ color: '#1B4B8C' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B4B8C' }}>새 반려동물 등록하기</p>
                    <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>새로운 가족을 추가할게요</p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#BDBDBD' }} />
                </button>

                {/* NO — go home */}
                <button
                  onClick={() => navigate('/home')}
                  className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: '54px',
                    background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(27,75,140,0.35)',
                  }}
                >
                  홈 화면으로 이동
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </MobileFrame>
  );
}
