import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import { Bell, Camera, PenLine, ChevronRight, AlertCircle } from 'lucide-react';
import { type PetProfileResponse, getActivePet, petEmoji, petTag } from '../api/profile';

const recentActivity = [
  { id: 1, date: '3/24', type: 'medical', icon: '🏥', title: '진료 기록', desc: '하나동물병원 · 피부과 진료', tag: 'AI 자동 분류', tagColor: '#1B4B8C', tagBg: '#E8F0FA' },
  { id: 2, date: '3/23', type: 'life', icon: '🐾', title: '생활 기록', desc: '산책 30분 · 식사 2회 · 배변 정상', tag: '직접 입력', tagColor: '#2E7D32', tagBg: '#E8F5E9' },
  { id: 3, date: '3/20', type: 'medical', icon: '🏥', title: '진료 기록', desc: 'OO동물병원 · 정기 건강검진', tag: 'AI 자동 분류', tagColor: '#1B4B8C', tagBg: '#E8F0FA' },
  { id: 4, date: '3/18', type: 'life', icon: '🍖', title: '생활 기록', desc: '산책 45분 · 음수량 320ml · 영양제 투여', tag: '직접 입력', tagColor: '#2E7D32', tagBg: '#E8F5E9' },
];

const alerts = [
  { id: 1, type: 'confirm', text: '심장사상충 예방약 투약일입니다', actionLabel: '확인', color: '#F57C00', bg: '#FFF8E1', borderColor: '#FFE082', icon: '💊' },
  { id: 2, type: 'record',  text: '어제 생활 기록이 비어있어요',   actionLabel: '기록하기', color: '#1B4B8C', bg: '#E8F0FA', borderColor: '#C5D8EE', icon: '📝' },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetProfileResponse | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [petError, setPetError] = useState(false);

  useEffect(() => {
    getActivePet()
      .then(setPet)
      .catch(() => setPetError(true))
      .finally(() => setPetLoading(false));
  }, []);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* App Header */}
        <div className="flex-shrink-0 bg-white px-5 flex items-center justify-between" style={{ height: '52px', borderBottom: '1px solid #EBEBEB' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#9E9E9E' }}>3월 26일 수요일</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>좋은 아침이에요, 김보호자님 👋</p>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}
            onClick={() => navigate('/notifications')}
          >
            <Bell size={18} style={{ color: '#1B4B8C' }} />
          </button>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Pet Profile Card */}
          <div className="px-5 pt-4 pb-2">
            <div
              className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', boxShadow: '0 4px 16px rgba(27,75,140,0.25)' }}
              onClick={() => navigate('/profile')}
            >
              {petLoading ? (
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>불러오는 중...</p>
                </div>
              ) : petError ? (
                <div className="flex-1">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>프로필을 불러오지 못했습니다</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>탭하여 프로필로 이동</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
                    {pet?.profileImageUrl ? (
                      <img src={pet.profileImageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: '30px' }}>{pet ? petEmoji(pet.type) : '🐾'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{pet?.name ?? '—'}</p>
                      {pet && (
                        <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          {petTag(pet.type, pet.dogSize)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                      {[pet?.breed, pet?.ageYears != null ? `만 ${pet.ageYears}세` : null, pet?.weightKg != null ? `${pet.weightKg}kg` : null].filter(Boolean).join(' · ')}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
                      {pet ? `${pet.gender === 'MALE' ? '수컷' : '암컷'} · ${pet.isNeutered ? '중성화 완료' : '중성화 미실시'}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                    style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="px-5 space-y-4 pb-4">

            {/* Today's Alerts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>오늘의 알림</p>
                <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1B4B8C', color: 'white', fontSize: '10px', fontWeight: 700 }}>
                  {alerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="rounded-xl p-3 flex items-center gap-3"
                    style={{ backgroundColor: alert.bg, border: `1px solid ${alert.borderColor}` }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{alert.icon}</span>
                    <p style={{ flex: 1, fontSize: '12px', color: '#1C1C1C', fontWeight: 500 }}>{alert.text}</p>
                    <button onClick={() => alert.type === 'record' ? navigate('/record') : navigate('/notifications')}
                      className="px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: alert.color, color: 'white', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      {alert.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E', marginBottom: '10px' }}>빠른 기록</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/medical-upload')}
                  className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', boxShadow: '0 4px 12px rgba(27,75,140,0.3)', minHeight: '100px' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Camera size={22} style={{ color: 'white' }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>영수증 촬영</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>OCR 자동 분석</p>
                  </div>
                </button>
                <button onClick={() => navigate('/record')}
                  className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                  style={{ backgroundColor: 'white', border: '1.5px solid #C5D8EE', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: '100px' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                    <PenLine size={22} style={{ color: '#1B4B8C' }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B4B8C' }}>생활 기록</p>
                    <p style={{ fontSize: '10px', color: '#6A9FD4', marginTop: '1px' }}>산책·식사·음수량</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B5E' }}>최근 기록</p>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0' }}>
                {recentActivity.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: '28px' }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span style={{ fontSize: '9px', color: '#BDBDBD', marginTop: '2px' }}>{item.date}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C' }}>{item.title}</span>
                        <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: item.tagBg, color: item.tagColor, fontSize: '9px', fontWeight: 600 }}>{item.tag}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#9E9E9E' }}>{item.desc}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: '#BDBDBD', flexShrink: 0 }} />
                  </div>
                ))}
                <button className="w-full py-3 flex items-center justify-center gap-1" style={{ borderTop: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: '12px', color: '#1B4B8C', fontWeight: 600 }}>전체 기록 보기</span>
                  <ChevronRight size={13} style={{ color: '#1B4B8C' }} />
                </button>
              </div>
            </div>

            {/* Mini Report Summary */}
            <div>
              <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4B8C 100%)', boxShadow: '0 4px 16px rgba(13,43,94,0.3)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>건강 리포트 요약</p>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>이번 주</span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '12px' }}>🚶</span>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>이번 주 산책: <span style={{ fontWeight: 700, color: 'white' }}>소형견 평균 대비 70%</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '12px' }}>🏥</span>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>최근 30일 진료: <span style={{ fontWeight: 700, color: 'white' }}>2회</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} style={{ color: '#FFB74D', flexShrink: 0 }} />
                    <p style={{ fontSize: '11px', color: '#FFB74D' }}>심장사상충 예방약 투약 필요</p>
                  </div>
                </div>
                <button onClick={() => navigate('/report')}
                  className="w-full rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.97]"
                  style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  <span>리포트 자세히 보기</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div style={{ height: '4px' }} />
          </div>
        </div>

        <BottomNav active="home" />
      </div>
    </MobileFrame>
  );
}