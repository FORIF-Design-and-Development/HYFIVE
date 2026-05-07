import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ChevronLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPw: string;
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ name: '', email: '', username: '', password: '', confirmPw: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeCamera, setAgreeCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const allAgreed = agreeService && agreePrivacy && agreeCamera;
  const toggleAll = () => {
    const v = !allAgreed;
    setAgreeService(v); setAgreePrivacy(v); setAgreeCamera(v);
  };

  const pwMatch = form.password === form.confirmPw && form.confirmPw.length > 0;
  const pwStrong = form.password.length >= 8;
  const canSubmit = form.name && form.email && form.username && pwStrong && pwMatch && agreeService && agreePrivacy;

  const handleSignup = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding/1');
    }, 1000);
  };

  const TermsRow = ({ label, value, onChange, detail }: { label: string; value: boolean; onChange: () => void; detail?: string }) => (
    <div className="flex items-start gap-3 py-2">
      <button onClick={onChange} className="mt-0.5 flex-shrink-0" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: value ? '#1B4B8C' : 'white', border: value ? '2px solid #1B4B8C' : '2px solid #BDBDBD', transition: 'all 0.15s' }}>
          {value && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      </button>
      <div className="flex-1">
        <span style={{ fontSize: '12px', color: '#1C1C1C', fontWeight: 500 }}>{label}</span>
        {detail && <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '2px' }}>{detail}</p>}
      </div>
    </div>
  );

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>회원가입</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 60%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Title */}
          <div className="mb-5">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2B5E' }}>HYFIVE 계정을 만들어주세요</h2>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>동일 계정으로 가족이 함께 반려동물 정보를 공유할 수 있어요</p>
          </div>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>이름</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="실명을 입력해주세요"
                className="w-full rounded-xl px-4"
                style={{ height: '44px', fontSize: '13px', border: form.name ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.name ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }} />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>이메일 (Google 계정)</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@gmail.com"
                className="w-full rounded-xl px-4"
                style={{ height: '44px', fontSize: '13px', border: form.email ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.email ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }} />
              <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '3px' }}>비밀번호 분실 시 임시 재설정 링크를 이메일로 발송합니다</p>
            </div>

            {/* Username */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>아이디</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="영문/숫자 조합 4~20자"
                className="w-full rounded-xl px-4"
                style={{ height: '44px', fontSize: '13px', border: form.username ? '2px solid #1B4B8C' : '1.5px solid #E0E0E0', backgroundColor: form.username ? '#E8F0FA' : 'white', color: '#1C1C1C', outline: 'none' }} />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>비밀번호</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="8자 이상 입력해주세요"
                  className="w-full rounded-xl px-4 pr-12"
                  style={{ height: '44px', fontSize: '13px', border: form.password ? (pwStrong ? '2px solid #1B4B8C' : '2px solid #F44336') : '1.5px solid #E0E0E0', backgroundColor: form.password ? (pwStrong ? '#E8F0FA' : '#FFF5F5') : 'white', color: '#1C1C1C', outline: 'none' }} />
                <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.password && !pwStrong && <p style={{ fontSize: '10px', color: '#F44336', marginTop: '3px' }}>비밀번호는 8자 이상이어야 합니다</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>비밀번호 확인</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPw} onChange={e => setForm({ ...form, confirmPw: e.target.value })} placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full rounded-xl px-4 pr-12"
                  style={{ height: '44px', fontSize: '13px', border: form.confirmPw ? (pwMatch ? '2px solid #4CAF50' : '2px solid #F44336') : '1.5px solid #E0E0E0', backgroundColor: form.confirmPw ? (pwMatch ? '#F1F8F1' : '#FFF5F5') : 'white', color: '#1C1C1C', outline: 'none' }} />
                <button onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9E9E9E', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.confirmPw && (
                <div className="flex items-center gap-1 mt-1">
                  {pwMatch
                    ? <><CheckCircle2 size={12} style={{ color: '#4CAF50' }} /><p style={{ fontSize: '10px', color: '#4CAF50' }}>비밀번호가 일치합니다</p></>
                    : <p style={{ fontSize: '10px', color: '#F44336' }}>비밀번호가 일치하지 않습니다</p>}
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0' }}>
            {/* All agree */}
            <button onClick={toggleAll} className="flex items-center gap-3 w-full pb-3 mb-1" style={{ borderBottom: '1px solid #F0F0F0', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px 0' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: allAgreed ? '#1B4B8C' : '#F5F5F5', border: allAgreed ? 'none' : '2px solid #E0E0E0', transition: 'all 0.15s' }}>
                {allAgreed && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: allAgreed ? '#1B4B8C' : '#1C1C1C' }}>전체 동의</span>
            </button>
            <div style={{ marginTop: '8px' }}>
              <TermsRow label="[필수] 서비스 이용방침 동의" value={agreeService} onChange={() => setAgreeService(v => !v)} />
              <TermsRow label="[필수] 개인정보 처리방침 동의" value={agreePrivacy} onChange={() => setAgreePrivacy(v => !v)} detail="HYFIVE는 PII 수집을 최소화하며, 반려동물 건강 관리 목적으로만 사용됩니다" />
              <TermsRow label="[필수] 카메라·GPS 권한 허용" value={agreeCamera} onChange={() => setAgreeCamera(v => !v)} detail="영수증 촬영 및 산책 경로 기록에 사용됩니다" />
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSignup} disabled={!canSubmit || loading}
            className="w-full rounded-xl transition-all active:scale-[0.98] mt-4"
            style={{ height: '50px', background: canSubmit ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)' : '#E0E0E0', color: 'white', fontSize: '15px', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed', boxShadow: canSubmit ? '0 4px 16px rgba(27,75,140,0.3)' : 'none', border: 'none', marginBottom: '8px' }}>
            {loading ? '계정 생성 중...' : '가입하고 시작하기'}
          </button>

          <div className="flex items-center justify-center gap-1 pb-6">
            <span style={{ fontSize: '12px', color: '#9E9E9E' }}>이미 계정이 있으신가요?</span>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#1B4B8C', fontWeight: 700, padding: 0 }}>
              로그인
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
