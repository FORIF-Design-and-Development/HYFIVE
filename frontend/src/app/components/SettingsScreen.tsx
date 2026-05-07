import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import {
  User, LogOut, Bell, ChevronRight, Shield,
  Footprints, UtensilsCrossed, Syringe, Pill,
  ToggleLeft, ToggleRight,
} from 'lucide-react';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
    >
      {on
        ? <ToggleRight size={32} style={{ color: '#1B4B8C' }} />
        : <ToggleLeft size={32} style={{ color: '#BDBDBD' }} />
      }
    </button>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#6A9FD4', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function RowLink({ label, sub, onPress }: { label: string; sub?: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      <div className="flex-1">
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1C' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>{sub}</p>}
      </div>
      <ChevronRight size={16} style={{ color: '#BDBDBD', flexShrink: 0 }} />
    </button>
  );
}

function RowToggle({ label, sub, on, onToggle }: { label: string; sub?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1C' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '1px' }}>{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', backgroundColor: '#F5F5F5', marginLeft: '16px', marginRight: '16px' }} />;
}

export default function SettingsScreen() {
  const navigate = useNavigate();

  // Account
  const [autoLogin, setAutoLogin] = useState(true);

  // Notification toggles
  const [notifUnrecorded, setNotifUnrecorded] = useState(true);
  const [notifWalk,       setNotifWalk]       = useState(true);
  const [notifMedication, setNotifMedication] = useState(true);
  const [notifVaccine,    setNotifVaccine]    = useState(false);

  // Logout confirm
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    navigate('/login');
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white px-5 flex items-center" style={{ height: '56px', borderBottom: '1px solid #EBEBEB' }}>
          <p style={{ fontSize: '17px', fontWeight: 800, color: '#0D2B5E' }}>설정</p>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 space-y-5 pb-4">

            {/* ── 계정 관리 ── */}
            <div>
              <SectionHeader icon={<User size={14} style={{ color: '#6A9FD4' }} />} label="계정 관리" />
              <Card>
                <RowToggle
                  label="자동 로그인"
                  sub={autoLogin ? '다음 실행 시 자동으로 로그인돼요' : '매번 로그인이 필요해요'}
                  on={autoLogin}
                  onToggle={() => setAutoLogin(v => !v)}
                />
                <Divider />
                <RowLink
                  label="개인정보 수정"
                  sub="이름·이메일 변경"
                  onPress={() => {/* stub */}}
                />
                <Divider />
                <RowLink
                  label="비밀번호 찾기"
                  onPress={() => navigate('/forgot-password')}
                />
                <Divider />
                <RowLink
                  label="프로필 전환 / 수정"
                  sub="반려동물 프로필 관리"
                  onPress={() => navigate('/profile/switch')}
                />
              </Card>
            </div>

            {/* ── 알림 설정 ── */}
            <div>
              <SectionHeader icon={<Bell size={14} style={{ color: '#6A9FD4' }} />} label="알림 설정" />
              <Card>
                <RowToggle
                  label="미기록 알림"
                  sub="생활 기록 누락 시 알려드려요"
                  on={notifUnrecorded}
                  onToggle={() => setNotifUnrecorded(v => !v)}
                />
                <Divider />
                <RowToggle
                  label="산책 알림"
                  sub="산책 권장량 미달 시 알려드려요"
                  on={notifWalk}
                  onToggle={() => setNotifWalk(v => !v)}
                />
                <Divider />
                <RowToggle
                  label="투약 알림"
                  sub="예방약 투약일을 알려드려요"
                  on={notifMedication}
                  onToggle={() => setNotifMedication(v => !v)}
                />
                <Divider />
                <RowToggle
                  label="예방접종 알림"
                  sub="다음 접종일이 가까워지면 알려드려요"
                  on={notifVaccine}
                  onToggle={() => setNotifVaccine(v => !v)}
                />
              </Card>

              {/* Notif summary chip */}
              <div className="mt-2 px-1">
                <p style={{ fontSize: '11px', color: '#9E9E9E' }}>
                  현재 활성 알림:{' '}
                  {[notifUnrecorded && '미기록', notifWalk && '산책', notifMedication && '투약', notifVaccine && '예방접종']
                    .filter(Boolean).join(' · ') || '없음'}
                </p>
              </div>
            </div>

            {/* ── 앱 정보 ── */}
            <div>
              <SectionHeader icon={<Shield size={14} style={{ color: '#6A9FD4' }} />} label="앱 정보" />
              <Card>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1C' }}>버전</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: 500 }}>v1.0.0 (beta)</p>
                </div>
                <Divider />
                <RowLink label="개인정보 처리방침" onPress={() => {}} />
                <Divider />
                <RowLink label="서비스 이용약관" onPress={() => {}} />
              </Card>
            </div>

            {/* ── 로그아웃 ── */}
            <div>
              {logoutConfirm ? (
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFCC80' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#E65100', textAlign: 'center', marginBottom: '12px' }}>
                    정말 로그아웃 하시겠어요?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogoutConfirm(false)}
                      className="flex-1 py-3 rounded-xl"
                      style={{ backgroundColor: '#F5F5F5', color: '#9E9E9E', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-3 rounded-xl"
                      style={{ backgroundColor: '#E65100', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ backgroundColor: 'white', border: '1.5px solid #FFCDD2', color: '#EF5350', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <LogOut size={16} style={{ color: '#EF5350' }} />
                  로그아웃
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pb-2">
              <p style={{ fontSize: '10px', color: '#BDBDBD' }}>HYFIVE © 2026 · AI 반려동물 건강케어</p>
            </div>
          </div>
        </div>

        <BottomNav active="settings" />
      </div>
    </MobileFrame>
  );
}