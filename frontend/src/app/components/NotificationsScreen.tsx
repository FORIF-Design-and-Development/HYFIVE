import { useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { ArrowLeft, Bell, BellOff, Check, ChevronRight } from 'lucide-react';

type NotifType = 'unrecorded' | 'walk' | 'medication' | 'vaccination';

interface Notif {
  id: number;
  type: NotifType;
  icon: string;
  title: string;
  sub: string;
  confirmed?: boolean;
}

const initialNotifs: Notif[] = [
  { id: 1, type: 'medication',   icon: '💊', title: '심장사상충 예방약 투약일',    sub: '마지막 투약 후 32일 경과' },
  { id: 2, type: 'unrecorded',   icon: '📝', title: '어제 생활 기록이 비어있어요', sub: '2일 연속 미기록' },
  { id: 3, type: 'walk',         icon: '🐾', title: '오늘 산책이 아직 없어요',     sub: '코코의 권장 산책량: 30분' },
  { id: 4, type: 'vaccination',  icon: '💉', title: '종합백신 접종 예정',          sub: '다음 접종까지 7일 남음' },
];

const typeConfig: Record<NotifType, { bg: string; border: string; titleColor: string; actionLabel: string; actionType: 'record' | 'confirm' }> = {
  unrecorded:  { bg: '#E8F0FA', border: '#C5D8EE', titleColor: '#1B4B8C', actionLabel: '기록하기', actionType: 'record' },
  walk:        { bg: '#E8F0FA', border: '#C5D8EE', titleColor: '#1B4B8C', actionLabel: '기록하기', actionType: 'record' },
  medication:  { bg: '#FFF8E1', border: '#FFE082', titleColor: '#E65100', actionLabel: '확인',     actionType: 'confirm' },
  vaccination: { bg: '#FFF8E1', border: '#FFE082', titleColor: '#E65100', actionLabel: '확인',     actionType: 'confirm' },
};

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [showEmpty, setShowEmpty] = useState(false);

  const handleAction = (notif: Notif) => {
    const cfg = typeConfig[notif.type];
    if (cfg.actionType === 'record') {
      navigate('/record');
    } else {
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, confirmed: true } : n));
    }
  };

  const dismiss = (id: number) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const activeNotifs = showEmpty ? [] : notifs;

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F5F7FC' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white px-4 flex items-center gap-3" style={{ height: '56px', borderBottom: '1px solid #EBEBEB' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
            <ArrowLeft size={18} style={{ color: '#1C1C1C' }} />
          </button>
          <div className="flex-1">
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>오늘의 알림</p>
          </div>
          {/* Demo toggle */}
          <button
            onClick={() => setShowEmpty(v => !v)}
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: showEmpty ? '#E8F0FA' : '#F5F5F5', fontSize: '10px', color: showEmpty ? '#1B4B8C' : '#9E9E9E', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            {showEmpty ? '알림 보기' : '빈 상태 보기'}
          </button>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Empty state */}
          {activeNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 pb-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F0FA' }}>
                <BellOff size={36} style={{ color: '#6A9FD4' }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1B4B8C' }}>알림이 없습니다</p>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '6px', lineHeight: '1.6' }}>
                  코코가 건강하게 지내고 있어요! 🐾<br />새로운 알림이 생기면 알려드릴게요.
                </p>
              </div>
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-3 rounded-2xl"
                style={{ backgroundColor: '#1B4B8C', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                홈으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="px-4 pt-4 pb-4 space-y-3">

              {/* Count badge */}
              <div className="flex items-center gap-2 mb-1">
                <Bell size={14} style={{ color: '#1B4B8C' }} />
                <p style={{ fontSize: '12px', color: '#1B4B8C', fontWeight: 700 }}>
                  확인이 필요한 알림 {activeNotifs.filter(n => !n.confirmed).length}건
                </p>
              </div>

              {/* Notification cards */}
              {activeNotifs.map(notif => {
                const cfg = typeConfig[notif.type];
                return (
                  <div
                    key={notif.id}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: notif.confirmed ? '#F9F9F9' : cfg.bg,
                      border: `1px solid ${notif.confirmed ? '#E0E0E0' : cfg.border}`,
                      opacity: notif.confirmed ? 0.7 : 1,
                      transition: 'all 0.3s',
                    }}
                  >
                    <div className="px-4 py-4 flex items-start gap-3">
                      <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '1px' }}>{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: notif.confirmed ? '#9E9E9E' : cfg.titleColor }}>
                          {notif.confirmed && <Check size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />}
                          {notif.title}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '3px' }}>{notif.sub}</p>

                        {!notif.confirmed && (
                          <div className="flex gap-2 mt-3">
                            {/* Action button */}
                            <button
                              onClick={() => handleAction(notif)}
                              className="flex items-center gap-1 px-4 py-2 rounded-xl"
                              style={{
                                backgroundColor: cfg.actionType === 'record' ? '#1B4B8C' : '#E65100',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {cfg.actionType === 'record'
                                ? <><ChevronRight size={13} />{cfg.actionLabel}</>
                                : <><Check size={13} />{cfg.actionLabel}</>
                              }
                            </button>
                            {/* Dismiss */}
                            <button
                              onClick={() => dismiss(notif.id)}
                              className="px-3 py-2 rounded-xl"
                              style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#9E9E9E', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            >
                              닫기
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Type label */}
                      <span
                        className="flex-shrink-0 px-2 py-0.5 rounded-full"
                        style={{
                          fontSize: '9px', fontWeight: 700,
                          backgroundColor: notif.type === 'unrecorded' || notif.type === 'walk' ? '#1B4B8C' : '#E65100',
                          color: 'white',
                        }}
                      >
                        {notif.type === 'unrecorded' ? '미기록'
                          : notif.type === 'walk' ? '산책'
                          : notif.type === 'medication' ? '투약'
                          : '예방접종'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* All confirmed state */}
              {activeNotifs.length > 0 && activeNotifs.every(n => n.confirmed) && (
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                  <Check size={18} style={{ color: '#2E7D32', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32' }}>모든 알림을 확인했어요 🎉</p>
                </div>
              )}

              <div style={{ height: '8px' }} />
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
