import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import MobileFrame from './MobileFrame';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import lionLogo from 'figma:asset/49bb8708313cd2aee9d6c816e878c53a7e094241.png';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // 보이는 커스텀 버튼 위에 투명하게 겹쳐둔 실제 Google 버튼이 영역 전체를 덮도록
  // 컨테이너 실제 너비를 측정해 GoogleLogin width로 넘긴다. (GIS는 240~400 범위만 허용)
  // 단 width가 바뀌면 GIS가 재초기화(initialize 중복 호출)되므로, 페인트 전에 1회만
  // 측정하고 측정이 끝난 뒤에만 GoogleLogin을 마운트한다. (측정값 0 = 아직 미측정)
  const googleWrapRef = useRef<HTMLDivElement>(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(0);

  useLayoutEffect(() => {
    const el = googleWrapRef.current;
    if (!el) return;
    const w = Math.round(el.getBoundingClientRect().width);
    if (w > 0) setGoogleBtnWidth(Math.min(400, Math.max(240, w)));
  }, []);

  const canLogin = email.length > 0 && password.length > 0;

  const handleLogin = () => {
    if (!canLogin) return;
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/welcome');
    }, 900);
  };

  const handleGoogleCredential = async (response: CredentialResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      if (!response.credential) throw new Error('No credential');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const token = data.token ?? data.accessToken ?? data.jwt;
      if (!token) throw new Error('No token in response');
      localStorage.setItem('hyfive_token', token);
      navigate('/welcome');
    } catch (e) {
      console.error('Google login failed:', e);
      setError('Google 로그인에 실패했습니다');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    setError('Google 로그인에 실패했습니다');
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

            {/* Forgot PW */}
            <div className="flex items-center justify-end pt-1">
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

          {/* Google Login — 실제 GIS 버튼을 그대로 노출.
              투명 오버레이로 커스텀 버튼을 덮는 방식은 GIS 클릭재킹 보호에 막혀
              클릭이 무시된다(버튼은 보이지만 안 눌림). 그래서 공식 버튼을 직접 렌더한다. */}
          <div
            ref={googleWrapRef}
            className="w-full flex items-center justify-center"
            style={{ height: '50px', colorScheme: 'light' }}>
            {GOOGLE_CLIENT_ID ? (
              googleLoading ? (
                <div className="flex items-center justify-center gap-2" style={{ height: '50px' }}>
                  <div className="rounded-full animate-spin" style={{ width: '18px', height: '18px', border: '2px solid #E8F0FA', borderTopColor: '#1B4B8C' }} />
                  <span style={{ fontSize: '13px', color: '#6A9FD4', fontWeight: 600 }}>로그인 중...</span>
                </div>
              ) : (
                // 너비 측정 후에만 마운트해 GIS initialize가 1회만 실행되게 한다. (측정값 0 = 미측정)
                googleBtnWidth > 0 && (
                  <GoogleLogin
                    onSuccess={handleGoogleCredential}
                    onError={handleGoogleError}
                    useOneTap={false}
                    width={String(googleBtnWidth)}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="signin_with"
                    logo_alignment="center"
                  />
                )
              )
            ) : (
              // clientId 미설정 시: 명확히 안내
              <button
                onClick={() => setError('Google 로그인이 설정되지 않았습니다 (클라이언트 ID 누락)')}
                className="w-full rounded-xl flex items-center justify-center gap-3"
                style={{ height: '50px', backgroundColor: 'white', border: '1.5px solid #E0E0E0', color: '#1C1C1C', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Google로 로그인
              </button>
            )}
          </div>

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