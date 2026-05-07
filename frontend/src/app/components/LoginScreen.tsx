import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canLogin = email.length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canLogin) return;
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/welcome-login');
    }, 900);
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>로그인</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1B4B8C)', boxShadow: '0 8px 24px rgba(27,75,140,0.3)' }}>
              <img src={lionLogo} alt="HYFIVE" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0D2B5E', letterSpacing: '4px', fontFamily: "'Nunito', sans-serif" }}>HYFIVE</h1>
            <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>AI 반려동물 건강 통합 관리</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Email/ID */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>이메일 또는 아이디</label>
              <input
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="이메일 또는 아이디를 입력하세요"
                className="w-full rounded-xl px-4"
                style={{ height: '48px', fontSize: '13px', border: email ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: email ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-xl px-4 pr-12"
                  style={{ height: '48px', fontSize: '13px', border: password ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: password ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }}
                />
                <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: '11px', color: '#E53935', textAlign: 'center' }}>{error}</p>
            )}

            {/* Auto login + Forgot PW */}
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => setAutoLogin(v => !v)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: autoLogin ? '#1B4B8C' : 'white', border: autoLogin ? '2px solid #1B4B8C' : '2px solid #BDBDBD', transition: 'all 0.2s' }}>
                  {autoLogin && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '12px', color: autoLogin ? '#1B4B8C' : '#9E9E9E', fontWeight: autoLogin ? 600 : 400 }}>자동 로그인</span>
              </button>
              <button
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6A9FD4', fontWeight: 500, padding: 0 }}
              >
                비밀번호 찾기
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button onClick={handleLogin} disabled={!canLogin || loading}
            className="w-full rounded-xl transition-all active:scale-[0.98] mt-5"
            style={{ height: '50px', background: canLogin ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0', color: 'white', fontSize: '15px', fontWeight: 700, cursor: canLogin ? 'pointer' : 'not-allowed', boxShadow: canLogin ? '0 4px 16px rgba(27,75,140,0.3)' : 'none', border: 'none' }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
            <span style={{ fontSize: '11px', color: '#BDBDBD', flexShrink: 0 }}>또는</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E0E0E0' }} />
          </div>

          {/* Google Login */}
          <button
            onClick={() => navigate('/welcome-login')}
            className="w-full rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            style={{ height: '50px', backgroundColor: 'white', border: '1.5px solid #E0E0E0', color: '#1C1C1C', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 로그인
          </button>

          {/* Signup Link */}
          <div className="flex items-center justify-center gap-1 mt-5">
            <span style={{ fontSize: '12px', color: '#9E9E9E' }}>아직 계정이 없으신가요?</span>
            <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#1B4B8C', fontWeight: 700, padding: 0 }}>
              회원가입
            </button>
          </div>

          {/* Terms Note */}
          <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
            로그인 시 서비스 이용방침 및 개인정보 처리방침에<br />동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}