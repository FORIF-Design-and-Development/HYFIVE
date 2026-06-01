import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Mail, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import lionLogo from 'figma:asset/49bb8708313cd2aee9d6c816e878c53a7e094241.png';

type Phase = 'input' | 'sent';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = () => {
    if (!isValidEmail) {
      setError('올바른 이메일 주소를 입력해주세요');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhase('sent');
    }, 1200);
  };

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

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
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>비밀번호 찾기</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #0D2B5E, #1B4B8C)', boxShadow: '0 8px 24px rgba(27,75,140,0.3)' }}
            >
              <img src={lionLogo} alt="HYFIVE" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0D2B5E', letterSpacing: '4px', fontFamily: "'Nunito', sans-serif" }}>HYFIVE</h1>
          </div>

          {phase === 'input' ? (
            <>
              <div className="mb-6">
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0D2B5E', marginBottom: '6px' }}>비밀번호를 잊으셨나요?</h2>
                <p style={{ fontSize: '12px', color: '#6E6E6E', lineHeight: 1.7 }}>
                  가입 시 등록한 이메일을 입력하시면<br />비밀번호 재설정 링크를 보내드려요
                </p>
              </div>

              {/* Email input */}
              <div className="space-y-3">
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                    이메일 주소
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="example@email.com"
                      className="w-full rounded-xl px-4 pl-11"
                      style={{
                        height: '50px',
                        fontSize: '13px',
                        border: error ? '2px solid #EF5350' : email ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                        backgroundColor: error ? '#FFF5F5' : email ? '#E8F0FA' : 'white',
                        color: '#1C1C1C',
                        outline: 'none',
                      }}
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: error ? '#EF5350' : '#6A9FD4' }} />
                  </div>
                  {error && <p style={{ fontSize: '11px', color: '#EF5350', marginTop: '5px' }}>{error}</p>}
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    height: '50px',
                    background: isValidEmail
                      ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                      : '#E0E0E0',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isValidEmail ? 'pointer' : 'not-allowed',
                    boxShadow: isValidEmail ? '0 4px 16px rgba(27,75,140,0.3)' : 'none',
                  }}
                >
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Mail size={16} />
                      재설정 링크 보내기
                    </>
                  )}
                </button>
              </div>

              {/* Tip box */}
              <div
                className="rounded-xl p-4 mt-5 flex gap-3"
                style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1B4B8C', marginBottom: '3px' }}>이메일이 기억나지 않나요?</p>
                  <p style={{ fontSize: '10px', color: '#2E6DB4', lineHeight: 1.6 }}>
                    가입 시 입력한 이름과 전화번호로 이메일을 찾을 수 있어요. 고객센터로 문의해 주세요.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Sent state */
            <>
              <div className="flex flex-col items-center text-center mb-6">
                {/* Success icon */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #E8F0FA 0%, #C5D8EE 100%)',
                    border: '3px solid #1B4B8C',
                  }}
                >
                  <CheckCircle2 size={38} style={{ color: '#1B4B8C' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0D2B5E', marginBottom: '8px' }}>
                  이메일을 확인해주세요!
                </h2>
                <p style={{ fontSize: '12px', color: '#6E6E6E', lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 700, color: '#1B4B8C' }}>{email}</span>으로<br />
                  비밀번호 재설정 링크를 발송했어요<br />
                  메일함을 확인해 링크를 눌러주세요
                </p>
              </div>

              {/* Simulated email card */}
              <div
                className="rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid #E0E0E0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}
                  >
                    <img src={lionLogo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C' }}>HYFIVE 보안팀</p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E' }}>noreply@hyfive.io</p>
                  </div>
                  <span
                    className="ml-auto px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#E8F0FA', fontSize: '9px', color: '#1B4B8C', fontWeight: 700 }}
                  >
                    방금 전
                  </span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', marginBottom: '6px' }}>
                  [HYFIVE] 비밀번호 재설정 링크
                </p>
                <p style={{ fontSize: '11px', color: '#6E6E6E', lineHeight: 1.6, marginBottom: '12px' }}>
                  안녕하세요. 비밀번호 재설정을 요청하셨습니다. 아래 버튼을 눌러 새 비밀번호를 설정해주세요. (유효시간: 30분)
                </p>
                {/* Simulated link click */}
                <button
                  onClick={() => navigate('/password-reset')}
                  className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{
                    height: '42px',
                    background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(27,75,140,0.25)',
                  }}
                >
                  비밀번호 재설정하기
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Resend */}
              <div className="flex items-center justify-center gap-2">
                <span style={{ fontSize: '12px', color: '#9E9E9E' }}>이메일을 받지 못하셨나요?</span>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#1B4B8C', fontWeight: 700, padding: 0 }}
                >
                  {loading ? '재발송 중...' : '재발송'}
                </button>
              </div>

              {/* Back to login */}
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl flex items-center justify-center gap-1 mt-4 transition-all active:scale-[0.98]"
                style={{
                  height: '44px',
                  backgroundColor: '#F0F5FF',
                  border: '1px solid #C5D8EE',
                  color: '#1B4B8C',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <ChevronLeft size={14} />
                로그인 화면으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
