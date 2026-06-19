import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { sendEmailCode, verifyEmailCode, EmailApiError } from '../api/email';

// Step definitions
const STEPS = [
  { id: 1, label: '이메일 입력' },
  { id: 2, label: '이메일 인증' },
  { id: 3, label: '비밀번호' },
  { id: 4, label: '비밀번호 확인' },
  { id: 5, label: '이름' },
  { id: 6, label: '닉네임' },
];

interface FormState {
  email: string;
  verifyCode: string;
  password: string;
  confirmPw: string;
  name: string;
  nickname: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: active ? '28px' : '20px',
                height: active ? '28px' : '20px',
                backgroundColor: done ? '#4CAF50' : active ? '#1B4B8C' : '#E0E0E0',
                boxShadow: active ? '0 2px 8px rgba(27,75,140,0.3)' : 'none',
              }}
            >
              {done ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span style={{ fontSize: active ? '11px' : '9px', fontWeight: 700, color: active ? 'white' : '#BDBDBD' }}>
                  {s.id}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: '18px',
                  height: '2px',
                  backgroundColor: done ? '#4CAF50' : '#E0E0E0',
                  margin: '0 2px',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SelfSignupScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    email: '',
    verifyCode: '',
    password: '',
    confirmPw: '',
    name: '',
    nickname: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const codeExpired = codeSent && secondsLeft === 0;

  // 코드 발송 후 3분(180초) 카운트다운
  useEffect(() => {
    if (!codeSent || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [codeSent, secondsLeft]);

  const mmss = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const pwValid = form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password);
  const pwMatch = form.password === form.confirmPw && form.confirmPw.length > 0;

  const handleSendCode = async () => {
    if (!isValidEmail) return;
    setSendError('');
    setSendingCode(true);
    try {
      const { expiresInSec } = await sendEmailCode(form.email);
      setCodeSent(true);
      setSecondsLeft(expiresInSec);
      setVerifyError('');
    } catch {
      setSendError('인증 코드 발송에 실패했어요. 잠시 후 다시 시도해주세요');
    } finally {
      setSendingCode(false);
    }
  };

  // step2 재발송 — 코드 재요청 + 타이머 리셋
  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setVerifyError('');
    update('verifyCode', '');
    try {
      const { expiresInSec } = await sendEmailCode(form.email);
      setSecondsLeft(expiresInSec);
    } catch {
      setVerifyError('재발송에 실패했어요. 잠시 후 다시 시도해주세요');
    } finally {
      setResending(false);
    }
  };

  const handleNext = async () => {
    // step2: 인증코드 검증 (실 API / mock)
    if (step === 2) {
      setLoading(true);
      try {
        await verifyEmailCode(form.email, form.verifyCode);
        setVerifyError('');
      } catch (err) {
        setVerifyError(
          err instanceof EmailApiError
            ? err.message
            : '인증 확인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요',
        );
        return;
      } finally {
        setLoading(false);
      }
      setStep(s => s + 1);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      if (step === 6) {
        // Validation check before terms
        const errors: string[] = [];
        if (!form.email) errors.push('이메일이 비어있습니다');
        if (!form.name) errors.push('이름이 비어있습니다');
        if (!pwValid) errors.push('비밀번호 조건을 만족하지 않습니다');
        if (!pwMatch) errors.push('비밀번호가 일치하지 않습니다');

        if (errors.length > 0) {
          setValidationErrors(errors);
          return;
        }
        navigate('/signup/terms?method=self');
        return;
      }

      setStep(s => s + 1);
    }, 400);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/signup');
    } else {
      setStep(s => s - 1);
    }
  };

  const canNext = (): boolean => {
    if (step === 1) return isValidEmail && codeSent;
    if (step === 2) return form.verifyCode.length === 6 && !codeExpired;
    if (step === 3) return pwValid;
    if (step === 4) return pwMatch;
    if (step === 5) return form.name.trim().length >= 2;
    if (step === 6) return true; // nickname is optional
    return false;
  };

  const update = (field: keyof FormState, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setValidationErrors([]);
    if (field === 'verifyCode') setVerifyError('');
  };

  const stepTitle = STEPS[step - 1]?.label ?? '';

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#1B4B8C' }}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>자체 회원가입</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        {/* Step indicator */}
        <div className="flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <StepIndicator current={step} />
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: '11px', color: '#9E9E9E' }}>
                {step} / {STEPS.length} 단계
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C' }}>{stepTitle}</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: '4px', backgroundColor: '#E8E8E8' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(step / STEPS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 100%)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* STEP 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <StepHeader
                emoji="📧"
                title="이메일을 입력해주세요"
                desc="로그인 아이디로 사용될 이메일을 입력해주세요"
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  이메일 주소
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="example@email.com"
                    className="flex-1 rounded-xl px-4"
                    style={{
                      height: '50px',
                      fontSize: '13px',
                      border: form.email ? (isValidEmail ? '2px solid #1B4B8C' : '2px solid #F44336') : '1.5px solid #E0E0E0',
                      backgroundColor: form.email ? (isValidEmail ? '#E8F0FA' : '#FFF5F5') : 'white',
                      color: '#1C1C1C',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={!isValidEmail || sendingCode || codeSent}
                    className="rounded-xl px-3 flex items-center justify-center gap-1 flex-shrink-0 transition-all active:scale-95"
                    style={{
                      height: '50px',
                      background: isValidEmail && !codeSent
                        ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                        : codeSent ? '#4CAF50' : '#E0E0E0',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: isValidEmail && !codeSent ? 'pointer' : 'default',
                      minWidth: '80px',
                    }}
                  >
                    {sendingCode ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : codeSent ? (
                      <><CheckCircle2 size={14} /> 발송됨</>
                    ) : (
                      <>인증 코드<br />보내기</>
                    )}
                  </button>
                </div>
                {form.email && !isValidEmail && (
                  <p style={{ fontSize: '10px', color: '#F44336', marginTop: '4px' }}>올바른 이메일 형식이 아닙니다</p>
                )}
                {sendError && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={13} style={{ color: '#F44336' }} />
                    <p style={{ fontSize: '11px', color: '#F44336' }}>{sendError}</p>
                  </div>
                )}
                {codeSent && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                    <CheckCircle2 size={13} style={{ color: '#4CAF50' }} />
                    <p style={{ fontSize: '11px', color: '#2E7D32' }}>{form.email}으로 인증 코드를 발송했어요</p>
                  </div>
                )}
                {!codeSent && (
                  <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '4px' }}>
                    * 이 이메일로 인증 코드가 발송되며, 비밀번호 분실 시에도 사용됩니다
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Email verification */}
          {step === 2 && (
            <div className="space-y-4">
              <StepHeader
                emoji="🔐"
                title="이메일을 인증해주세요"
                desc={`${form.email}으로 발송된 6자리 코드를 입력해주세요`}
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  인증 코드 6자리
                </label>
                <input
                  type="text"
                  value={form.verifyCode}
                  onChange={(e) => update('verifyCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-xl px-4 text-center"
                  maxLength={6}
                  style={{
                    height: '60px',
                    fontSize: '26px',
                    fontWeight: 800,
                    letterSpacing: '12px',
                    border: verifyError ? '2px solid #F44336' : form.verifyCode.length === 6 ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                    backgroundColor: verifyError ? '#FFF5F5' : form.verifyCode.length === 6 ? '#E8F0FA' : 'white',
                    color: '#1C1C1C',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
                {verifyError && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={13} style={{ color: '#F44336' }} />
                    <p style={{ fontSize: '11px', color: '#F44336' }}>{verifyError}</p>
                  </div>
                )}
                {/* 3분(180초) 카운트다운 / 만료 안내 */}
                {codeExpired ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={13} style={{ color: '#F44336' }} />
                    <p style={{ fontSize: '11px', color: '#F44336' }}>인증 코드가 만료되었어요. 재발송해주세요</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock size={13} style={{ color: secondsLeft <= 30 ? '#F44336' : '#6A9FD4' }} />
                    <p style={{ fontSize: '11px', fontWeight: 600, color: secondsLeft <= 30 ? '#F44336' : '#6A9FD4' }}>
                      남은 시간 {mmss(secondsLeft)}
                    </p>
                  </div>
                )}
              </div>
              <div
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082' }}
              >
                <span style={{ fontSize: '14px' }}>💡</span>
                <div>
                  <p style={{ fontSize: '11px', color: '#F57C00', fontWeight: 600 }}>
                    테스트 코드: <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>123456</span>
                  </p>
                  <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>실제 서비스에서는 이메일로 발송됩니다</p>
                </div>
              </div>
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5"
                style={{ fontSize: '12px', color: resending ? '#BDBDBD' : '#6A9FD4', fontWeight: 600, background: 'none', border: 'none', cursor: resending ? 'default' : 'pointer', padding: 0 }}
              >
                {resending && <RefreshCw size={12} className="animate-spin" />}
                {resending ? '재발송 중…' : '코드를 받지 못하셨나요? 재발송'}
              </button>
            </div>
          )}

          {/* STEP 3: Password */}
          {step === 3 && (
            <div className="space-y-4">
              <StepHeader
                emoji="🔑"
                title="비밀번호를 입력해주세요"
                desc="영문과 숫자를 포함하여 8자 이상으로 설정해주세요"
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="8자 이상, 영문+숫자 포함"
                    className="w-full rounded-xl px-4 pr-12"
                    style={{
                      height: '50px',
                      fontSize: '13px',
                      border: form.password ? (pwValid ? '2px solid #1B4B8C' : '2px solid #F44336') : '1.5px solid #E0E0E0',
                      backgroundColor: form.password ? (pwValid ? '#E8F0FA' : '#FFF5F5') : 'white',
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
                {/* Strength checklist */}
                {form.password && (
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: '8자 이상', ok: form.password.length >= 8 },
                      { label: '영문 포함', ok: /[a-zA-Z]/.test(form.password) },
                      { label: '숫자 포함', ok: /[0-9]/.test(form.password) },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: c.ok ? '#4CAF50' : '#E0E0E0' }}
                        >
                          {c.ok && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: '11px', color: c.ok ? '#4CAF50' : '#BDBDBD' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Confirm Password */}
          {step === 4 && (
            <div className="space-y-4">
              <StepHeader
                emoji="🔒"
                title="비밀번호를 한 번 더 입력해주세요"
                desc="앞서 입력한 비밀번호와 동일하게 입력해주세요"
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPw}
                    onChange={(e) => update('confirmPw', e.target.value)}
                    placeholder="비밀번호를 다시 입력해주세요"
                    className="w-full rounded-xl px-4 pr-12"
                    style={{
                      height: '50px',
                      fontSize: '13px',
                      border: form.confirmPw ? (pwMatch ? '2px solid #4CAF50' : '2px solid #F44336') : '1.5px solid #E0E0E0',
                      backgroundColor: form.confirmPw ? (pwMatch ? '#F1F8F1' : '#FFF5F5') : 'white',
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
                {form.confirmPw && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {pwMatch
                      ? <><CheckCircle2 size={13} style={{ color: '#4CAF50' }} /><p style={{ fontSize: '11px', color: '#4CAF50' }}>비밀번호가 일치합니다</p></>
                      : <><AlertCircle size={13} style={{ color: '#F44336' }} /><p style={{ fontSize: '11px', color: '#F44336' }}>비밀번호가 일치하지 않습니다</p></>
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Name */}
          {step === 5 && (
            <div className="space-y-4">
              <StepHeader
                emoji="👤"
                title="이름을 입력해주세요"
                desc="반려동물 진료기록 연동 시 보호자 이름으로 사용됩니다"
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  이름 (실명)
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-xl px-4"
                  style={{
                    height: '50px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: form.name ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                    backgroundColor: form.name ? '#E8F0FA' : 'white',
                    color: '#1C1C1C',
                    outline: 'none',
                  }}
                />
                {form.name && form.name.trim().length < 2 && (
                  <p style={{ fontSize: '10px', color: '#F44336', marginTop: '4px' }}>이름은 2자 이상 입력해주세요</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Nickname (optional) + Validation */}
          {step === 6 && (
            <div className="space-y-4">
              <StepHeader
                emoji="🏷️"
                title="닉네임을 입력해주세요"
                desc="앱 내에서 표시될 닉네임이에요. 입력하지 않으면 이름으로 표시됩니다 (선택)"
              />
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                  닉네임 <span style={{ color: '#BDBDBD', fontWeight: 400 }}>(선택)</span>
                </label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => update('nickname', e.target.value)}
                  placeholder={`${form.name}님의 닉네임 (미입력 시 이름 사용)`}
                  className="w-full rounded-xl px-4"
                  style={{
                    height: '50px',
                    fontSize: '13px',
                    border: form.nickname ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0',
                    backgroundColor: form.nickname ? '#E8F0FA' : 'white',
                    color: '#1C1C1C',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Summary card */}
              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'white', border: '1.5px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
              >
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>📋 입력 정보 확인</p>
                {[
                  { label: '이메일', value: form.email, ok: true },
                  { label: '이메일 인증', value: '완료 ✅', ok: true },
                  { label: '비밀번호', value: '●●●●●●●●', ok: pwValid },
                  { label: '이름', value: form.name, ok: form.name.trim().length >= 2 },
                  { label: '닉네임', value: form.nickname || `${form.name} (기본값)`, ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: item.ok ? '#1C1C1C' : '#F44336' }}>
                        {item.value}
                      </span>
                      {!item.ok && <AlertCircle size={12} style={{ color: '#F44336' }} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: '#FFF5F5', border: '1.5px solid #FFCDD2' }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#C62828', marginBottom: '6px' }}>
                    ⚠️ 필수 항목을 확인해주세요
                  </p>
                  {validationErrors.map((e, i) => (
                    <p key={i} style={{ fontSize: '11px', color: '#E53935', marginBottom: '2px' }}>• {e}</p>
                  ))}
                  <button
                    onClick={() => { setStep(1); setValidationErrors([]); }}
                    style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px', padding: 0 }}
                  >
                    처음부터 다시 입력하기 →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-5 py-4 bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
          <button
            onClick={handleNext}
            disabled={!canNext() || loading}
            className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              height: '52px',
              background: canNext()
                ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                : '#E0E0E0',
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              cursor: canNext() ? 'pointer' : 'not-allowed',
              boxShadow: canNext() ? '0 4px 16px rgba(27,75,140,0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : step === 6 ? (
              '약관 동의 →'
            ) : (
              '다음 단계'
            )}
          </button>
          {step === 6 && (
            <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', marginTop: '8px' }}>
              다음 단계에서 서비스 이용약관 동의가 필요합니다
            </p>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}

function StepHeader({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-2">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #E8F0FA 0%, #C5D8EE 100%)', border: '1px solid #C5D8EE' }}
      >
        <span style={{ fontSize: '20px' }}>{emoji}</span>
      </div>
      <div>
        <p style={{ fontSize: '16px', fontWeight: 800, color: '#0D2B5E', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: '#6E6E6E', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}
