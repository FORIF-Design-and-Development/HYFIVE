import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import NavHeader from './NavHeader';
import { Check, Mail, CalendarDays, AlertCircle } from 'lucide-react';
import { getMe, updateMe, UserApiError, UserNetworkError, type UserProfile } from '../api/user';

function formatJoinedDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function resolveError(e: unknown): string {
  if (e instanceof UserNetworkError) return '서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.';
  if (e instanceof UserApiError) {
    if (e.status === 401) return '로그인이 만료되었어요. 다시 로그인해주세요.';
    if (e.status === 400) return e.message || '입력값을 다시 확인해주세요.';
    return e.message || '요청을 처리하지 못했어요.';
  }
  return '요청을 처리하지 못했어요.';
}

export default function ProfileEditScreen() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const me = await getMe();
      setProfile(me);
      setName(me.name ?? '');
      setNickname(me.nickname ?? '');
    } catch (e) {
      setLoadError(resolveError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const trimmedName = name.trim();
  const nameInvalid = trimmedName.length === 0;
  const dirty =
    !!profile && (trimmedName !== (profile.name ?? '') || nickname.trim() !== (profile.nickname ?? ''));
  const canSave = !!profile && !nameInvalid && dirty && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaveError('');
    setSaving(true);
    try {
      const updated = await updateMe({ name: trimmedName, nickname: nickname.trim() });
      setProfile(updated);
      setName(updated.name ?? '');
      setNickname(updated.nickname ?? '');
      setSaved(true);
      setTimeout(() => navigate(-1), 900);
    } catch (e) {
      setSaveError(resolveError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>
        <NavHeader title="개인정보 수정" subtitle="이름과 닉네임을 변경할 수 있어요" />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 space-y-5 pb-6">

            {loading ? (
              <div className="flex flex-col items-center justify-center" style={{ paddingTop: '64px' }}>
                <div
                  className="rounded-full animate-spin"
                  style={{ width: '32px', height: '32px', border: '3px solid #E8F0FA', borderTopColor: '#1B4B8C' }}
                />
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '12px' }}>정보를 불러오는 중...</p>
              </div>
            ) : loadError ? (
              <div className="rounded-2xl p-5 flex flex-col items-center text-center" style={{ backgroundColor: 'white', border: '1px solid #FFCDD2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <AlertCircle size={28} style={{ color: '#EF5350' }} />
                <p style={{ fontSize: '13px', color: '#C62828', fontWeight: 600, marginTop: '10px', lineHeight: 1.5 }}>{loadError}</p>
                <button
                  onClick={load}
                  className="rounded-xl mt-4 px-5"
                  style={{ height: '40px', backgroundColor: '#1B4B8C', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <>
                {/* 읽기 전용 정보 */}
                <section>
                  <SectionLabel num={1} text="계정 정보 (수정 불가)" />
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <ReadOnlyRow icon={<Mail size={16} style={{ color: '#6A9FD4' }} />} label="이메일" value={profile?.email || '-'} />
                    <div style={{ height: '1px', backgroundColor: '#F5F5F5', marginLeft: '16px', marginRight: '16px' }} />
                    <ReadOnlyRow icon={<CalendarDays size={16} style={{ color: '#6A9FD4' }} />} label="가입일" value={formatJoinedDate(profile?.createdAt || '')} />
                  </div>
                </section>

                {/* 편집 가능 */}
                <section>
                  <SectionLabel num={2} text="프로필" />
                  <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: '1px solid #E0E0E0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    {/* 이름 */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                        이름 <span style={{ color: '#EF5350' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setSaveError(''); }}
                        placeholder="이름을 입력하세요"
                        maxLength={30}
                        className="w-full rounded-xl px-4 outline-none"
                        style={{
                          height: '48px',
                          fontSize: '13px',
                          border: nameInvalid ? '2px solid #EF5350' : '1.5px solid #E0E0E0',
                          backgroundColor: nameInvalid ? '#FFF5F5' : '#F8FAFF',
                          color: '#1C1C1C',
                        }}
                      />
                      {nameInvalid && (
                        <p style={{ fontSize: '11px', color: '#EF5350', marginTop: '5px' }}>이름은 필수 항목이에요</p>
                      )}
                    </div>

                    {/* 닉네임 */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#1B4B8C', display: 'block', marginBottom: '5px' }}>
                        닉네임 <span style={{ color: '#9E9E9E', fontWeight: 400 }}>(선택)</span>
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => { setNickname(e.target.value); setSaveError(''); }}
                        placeholder="닉네임을 입력하세요"
                        maxLength={30}
                        className="w-full rounded-xl px-4 outline-none"
                        style={{ height: '48px', fontSize: '13px', border: '1.5px solid #E0E0E0', backgroundColor: '#F8FAFF', color: '#1C1C1C' }}
                      />
                    </div>
                  </div>
                </section>

                {saveError && (
                  <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, lineHeight: '18px' }}>⚠️</span>
                    <p style={{ fontSize: '12px', color: '#C62828', fontWeight: 600, lineHeight: 1.4 }}>{saveError}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        {!loading && !loadError && (
          <div className="flex-shrink-0 px-4 py-4 bg-white" style={{ borderTop: '1px solid #EBEBEB' }}>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{
                height: '52px',
                background: saved
                  ? 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)'
                  : canSave
                    ? 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)'
                    : 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
                boxShadow: '0 4px 16px rgba(27,75,140,0.3)',
                color: 'white',
                fontWeight: 800,
                fontSize: '15px',
                cursor: canSave ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
              }}
            >
              {saved ? (
                <>
                  <Check size={18} />
                  저장 완료!
                </>
              ) : saving ? (
                '저장 중...'
              ) : (
                '저장'
              )}
            </button>
            <p style={{ fontSize: '10px', color: '#BDBDBD', textAlign: 'center', marginTop: '8px' }}>
              이메일과 가입일은 변경할 수 없어요
            </p>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}

function ReadOnlyRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</div>
      <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: 500, width: '56px', flexShrink: 0 }}>{label}</p>
      <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: 600, flex: 1, textAlign: 'right', wordBreak: 'break-all' }}>{value}</p>
    </div>
  );
}

function SectionLabel({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1B4B8C' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'white' }}>{num}</span>
      </div>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>{text}</p>
    </div>
  );
}
