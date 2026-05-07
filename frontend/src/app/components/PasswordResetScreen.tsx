import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { Eye, EyeOff, CheckCircle2, ShieldCheck, ChevronLeft } from 'lucide-react';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

type Phase = 'form' | 'done';

function PwStrengthBar({ pw }: { pw: string }) {
  const checks = [
    { label: '8자 이상', ok: pw.length >= 8 },
    { label: '영문 포함', ok: /[a-zA-Z]/.test(pw) },
    { label: '숫자 포함', ok: /[0-9]/.test(pw) },
    { label: '특수문자', ok: /[!@#$%^&*]/.test(pw) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#E0E0E0', '#EF5350', '#FF9800', '#FDD835', '#4CAF50'];
  const labels = ['', '매우 약함', '약함', '보통', '강함'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all"
            style={{ height: '4px', backgroundColor: i <= score ? colors[score] : '#E8E8E8' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: c.ok ? '#4CAF50' : '#E0E0E0' }}
              >
                {c.ok && <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: '9px', color: c.ok ? '#4CAF50' : '#BDBDBD' }}>{c.label}</span>
            </div>
          ))}
        </div>
        {pw && <span style={{ fontSize: '10px', fontWeight: 700, color: colors[score] }}>{labels[score]}</span>}
      </div>
    </div>
  );
}

export default function PasswordResetScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('form');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwValid = pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
  const pwMatch = pw === confirm && confirm.length > 0;
  const canSubmit = pwValid && pwMatch;

  const handleReset = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPhase('done');
    }, 1000);
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#1B4B8C' }}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>비밀번호 재설정</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-6">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: 'linear-gradient(135deg, #0D2B5E, #1B4B8C)', boxShadow: '0 6px 20px rgba(27,75,140,0.3)' }}
            >
              <img src={lionLogo} alt="HYFIVE" style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2B5E', letterSpacing: '4px', fontFamily: "'Nunito', sans-serif" }}>HYFIVE</h1>
          </div>

          {phase === 'form' ? (
            <>
              <div className="mb-6">
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0D2B5E', marginBottom: '6px' }}>새 비밀번호를 입력하세요</h2>
                <p style={{ fontSize: '12px', color: '#6E6E6E', lineHeight: 1.7 }}>
                  이전 비밀번호와 다른 새 비밀번호를 설정해주세요
                </p>
              </div>

              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="8자 이상, 영문+숫자 포함"
                      className="w-full rounded-xl px-4 pr-12"
                      style={{
                        height: '50px',
                        fontSize: '13px',
                        border: pw ? (pwValid ? '2px solid #1B4B8C' : '2px solid #F44336') : '1.5px solid #E0E0E0',
                        backgroundColor: pw ? (pwValid ? '#E8F0FA' : '#FFF5F5') : 'white',
                        color: '#1C1C1C',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {pw && <PwStrengthBar pw={pw} />}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="비밀번호를 다시 입력해주세요"
                      className="w-full rounded-xl px-4 pr-12"
                      style={{
                        height: '50px',
                        fontSize: '13px',
                        border: confirm ? (pwMatch ? '2px solid #4CAF50' : '2px solid #F44336') : '1.5px solid #E0E0E0',
                        backgroundColor: confirm ? (pwMatch ? '#F1F8F1' : '#FFF5F5') : 'white',
                        color: '#1C1C1C',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirm && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {pwMatch
                        ? <><CheckCircle2 size={12} style={{ color: '#4CAF50' }} /><p style={{ fontSize: '10px', color: '#4CAF50' }}>비밀번호가 일치합니다</p></>
                        : <p style={{ fontSize: '10px', color: '#F44336' }}>비밀번호가 일치하지 않습니다</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Security note */}
              <div
                className="rounded-xl p-3 mt-4 flex items-center gap-3"
                style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}
              >
                <ShieldCheck size={16} style={{ color: '#1B4B8C', flexShrink: 0 }} />
                <p style={{ fontSize: '10px', color: '#2E6DB4', lineHeight: 1.6 }}>
                  재설정 후 기존 세션은 자동으로 로그아웃됩니다. 모든 기기에서 새 비밀번호로 로그인해주세요.
                </p>
              </div>

              <button
                onClick={handleReset}
                disabled={!canSubmit || loading}
                className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-5"
                style={{
                  height: '52px',
                  background: canSubmit
                    ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                    : '#E0E0E0',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit ? '0 4px 16px rgba(27,75,140,0.3)' : 'none',
                }}
              >
                {loading ? '저장 중...' : '비밀번호 재설정 완료'}
              </button>
            </>
          ) : (
            /* Done */
            <div className="flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                  border: '3px solid #4CAF50',
                }}
              >
                <CheckCircle2 size={44} style={{ color: '#4CAF50' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0D2B5E', marginBottom: '10px' }}>
                재설정 완료!
              </h2>
              <p style={{ fontSize: '13px', color: '#6E6E6E', lineHeight: 1.8, marginBottom: '32px' }}>
                비밀번호가 성공적으로 변경됐어요<br />새 비밀번호로 다시 로그인해주세요
              </p>

              {/* Confetti dots */}
              <div className="flex gap-2 mb-8">
                {['#1B4B8C', '#6A9FD4', '#4CAF50', '#FFB74D', '#1B4B8C'].map((c, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c, opacity: 0.7 }} />
                ))}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  height: '52px',
                  background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
                }}
              >
                로그인 화면으로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
