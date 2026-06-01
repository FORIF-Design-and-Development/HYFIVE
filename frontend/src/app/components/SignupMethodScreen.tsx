import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import lionLogo from 'figma:asset/49bb8708313cd2aee9d6c816e878c53a7e094241.png';

export default function SignupMethodScreen() {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#1B4B8C' }}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>회원가입</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #0D2B5E, #1B4B8C)', boxShadow: '0 10px 32px rgba(27,75,140,0.35)' }}
            >
              <img src={lionLogo} alt="HYFIVE" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0D2B5E', letterSpacing: '4px', fontFamily: "'Nunito', sans-serif" }}>HYFIVE</h1>
            <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>AI 반려동물 건강 통합 관리</p>
          </div>

          <div className="mb-5 text-center">
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0D2B5E' }}>가입 방법을 선택해주세요</h2>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '5px' }}>
              빠른 가입 또는 이메일로 직접 가입할 수 있어요
            </p>
          </div>

          <div className="space-y-3 flex-1">

            {/* Google signup */}
            <button
              onClick={() => navigate('/signup/terms?method=google')}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'white',
                border: '1.5px solid #E0E0E0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F8F8F8', border: '1px solid #EBEBEB' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1C' }}>Google로 시작하기</p>
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>빠르고 간편하게 가입해요</p>
              </div>
              <ChevronRight size={18} style={{ color: '#BDBDBD', flexShrink: 0 }} />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E8E8' }} />
              <span style={{ fontSize: '11px', color: '#BDBDBD' }}>또는</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E8E8' }} />
            </div>

            {/* Self signup */}
            <button
              onClick={() => navigate('/signup/self')}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Mail size={22} style={{ color: 'white' }} />
              </div>
              <div className="flex-1 text-left">
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>이메일로 가입하기</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>직접 계정 정보를 입력해요</p>
              </div>
              <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
            </button>

            {/* Benefits */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE', marginTop: '4px' }}
            >
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '10px' }}>🐾 HYFIVE 가입 혜택</p>
              {[
                { emoji: '🤖', text: 'AI 영수증 자동 분석으로 진료기록 자동 정리' },
                { emoji: '📊', text: '산책·식사·음수량 기반 팩트 건강 리포트' },
                { emoji: '💊', text: '예방접종·투약 일정 자동 알림' },
                { emoji: '👨‍👩‍👧', text: '가족 공유 — 한 계정으로 모두가 함께 관리' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{b.emoji}</span>
                  <p style={{ fontSize: '11px', color: '#2E6DB4' }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Login link */}
          <div className="flex items-center justify-center gap-1 pt-4 pb-2">
            <span style={{ fontSize: '12px', color: '#9E9E9E' }}>이미 계정이 있으신가요?</span>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#1B4B8C', fontWeight: 700, padding: 0 }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
