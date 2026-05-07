import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import { Play, Pause, Square, Share2, ChevronLeft, Navigation, Timer, Footprints, Flame } from 'lucide-react';

type WalkState = 'ready' | 'walking' | 'paused' | 'done';

interface WalkStats {
  seconds: number;
  distanceM: number;
  calories: number;
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatDist(m: number) {
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(2)}km`;
}

// Static mock path points for the SVG map
const PATH_POINTS = [
  [60, 140], [90, 120], [130, 110], [170, 125], [200, 150],
  [215, 185], [200, 215], [170, 230], [135, 235], [100, 220],
  [75, 195], [60, 165], [60, 140],
] as [number, number][];

function MapView({ progress }: { progress: number }) {
  const pts = PATH_POINTS.slice(0, Math.max(2, Math.round(progress * PATH_POINTS.length)));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const current = pts[pts.length - 1];

  return (
    <div className="relative w-full" style={{ height: '220px', overflow: 'hidden', borderRadius: '0' }}>
      {/* Map background (mockup) */}
      <svg width="100%" height="220" viewBox="0 0 280 220" style={{ position: 'absolute', inset: 0 }}>
        {/* Background */}
        <rect width="280" height="220" fill="#E8F0FA"/>
        {/* Grid lines (streets) */}
        {[40, 80, 120, 160, 200, 240].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="220" stroke="#D0DCEA" strokeWidth="1"/>
        ))}
        {[40, 80, 120, 160].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="280" y2={y} stroke="#D0DCEA" strokeWidth="6"/>
        ))}
        {/* Park area */}
        <rect x="90" y="120" width="100" height="60" rx="8" fill="#C8E6C9" opacity="0.7"/>
        <text x="140" y="155" textAnchor="middle" fill="#4CAF50" fontSize="9" fontWeight="600">공원</text>
        {/* Street labels */}
        <text x="15" y="38" fill="#BDBDBD" fontSize="8">대로</text>
        <text x="15" y="78" fill="#BDBDBD" fontSize="8">중로</text>
        {/* Walk path */}
        <path d={d} fill="none" stroke="#1B4B8C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
        {/* Start pin */}
        <circle cx={PATH_POINTS[0][0]} cy={PATH_POINTS[0][1]} r="7" fill="#4CAF50"/>
        <text x={PATH_POINTS[0][0]} y={PATH_POINTS[0][1] + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">S</text>
        {/* Current position */}
        <circle cx={current[0]} cy={current[1]} r="9" fill="#1B4B8C" opacity="0.2"/>
        <circle cx={current[0]} cy={current[1]} r="6" fill="#1B4B8C"/>
        <circle cx={current[0]} cy={current[1]} r="2.5" fill="white"/>
      </svg>
      {/* GPS Label */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'rgba(27,75,140,0.85)' }}>
        <Navigation size={10} style={{ color: 'white' }} />
        <span style={{ fontSize: '9px', color: 'white', fontWeight: 700 }}>GPS 추적 중</span>
      </div>
    </div>
  );
}

export default function WalkScreen() {
  const navigate = useNavigate();
  const [walkState, setWalkState] = useState<WalkState>('ready');
  const [stats, setStats] = useState<WalkStats>({ seconds: 0, distanceM: 0, calories: 0 });
  const [progress, setProgress] = useState(0.15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startWalk = () => {
    setWalkState('walking');
    timerRef.current = setInterval(() => {
      setStats(s => ({
        seconds: s.seconds + 1,
        distanceM: Math.round(s.distanceM + 1.8),
        calories: Math.round(s.calories + 0.12),
      }));
      setProgress(p => Math.min(1, p + 0.012));
    }, 1000);
  };

  const pauseWalk = () => {
    setWalkState('paused');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeWalk = () => {
    setWalkState('walking');
    timerRef.current = setInterval(() => {
      setStats(s => ({
        seconds: s.seconds + 1,
        distanceM: Math.round(s.distanceM + 1.8),
        calories: Math.round(s.calories + 0.12),
      }));
      setProgress(p => Math.min(1, p + 0.012));
    }, 1000);
  };

  const stopWalk = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWalkState('done');
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#F8FAFD' }}>

        {/* Header */}
        <div className="flex-shrink-0 bg-white flex items-center px-4" style={{ height: '52px', borderBottom: '1px solid #E8E8E8' }}>
          <button onClick={() => navigate('/home')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: '#1B4B8C' }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1C1C' }}>산책 기록</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: '#E8F0FA' }}>
            <span style={{ fontSize: '11px', color: '#1B4B8C', fontWeight: 700 }}>코코 🐶</span>
          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)', flexShrink: 0 }} />

        <div className="flex-1 overflow-y-auto">
          {walkState !== 'done' ? (
            <>
              {/* Map */}
              <MapView progress={progress} />

              {/* Live Stats */}
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Timer size={18} style={{ color: '#1B4B8C' }} />, label: '시간', value: formatTime(stats.seconds) },
                    { icon: <Footprints size={18} style={{ color: '#2E6DB4' }} />, label: '거리', value: formatDist(stats.distanceM) },
                    { icon: <Flame size={18} style={{ color: '#F57C00' }} />, label: '칼로리', value: `${Math.round(stats.calories)}kcal` },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div className="flex justify-center mb-1">{item.icon}</div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>{item.value}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Status */}
                {walkState === 'ready' && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                    <Navigation size={18} style={{ color: '#1B4B8C' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E' }}>시작 준비 완료</p>
                      <p style={{ fontSize: '10px', color: '#6A9FD4' }}>GPS 신호를 확인했어요. 시작 버튼을 눌러주세요.</p>
                    </div>
                  </div>
                )}
                {walkState === 'walking' && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4CAF50' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>산책 중</p>
                      <p style={{ fontSize: '10px', color: '#388E3C' }}>경로가 실시간으로 기록되고 있어요</p>
                    </div>
                  </div>
                )}
                {walkState === 'paused' && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082' }}>
                    <Pause size={16} style={{ color: '#F57C00' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#E65100' }}>일시 정지됨</p>
                      <p style={{ fontSize: '10px', color: '#EF6C00' }}>다시 시작하면 기록이 이어집니다</p>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                  {walkState === 'ready' && (
                    <button onClick={startWalk}
                      className="flex-1 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ height: '56px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '16px', fontWeight: 700, boxShadow: '0 6px 20px rgba(27,75,140,0.35)', border: 'none' }}>
                      <Play size={20} />
                      산책 시작
                    </button>
                  )}
                  {walkState === 'walking' && (
                    <>
                      <button onClick={pauseWalk}
                        className="flex-1 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        style={{ height: '56px', backgroundColor: 'white', border: '2px solid #1B4B8C', color: '#1B4B8C', fontSize: '15px', fontWeight: 700 }}>
                        <Pause size={18} />
                        일시정지
                      </button>
                      <button onClick={stopWalk}
                        className="rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        style={{ height: '56px', width: '80px', backgroundColor: '#F44336', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none' }}>
                        <Square size={16} />
                        종료
                      </button>
                    </>
                  )}
                  {walkState === 'paused' && (
                    <>
                      <button onClick={resumeWalk}
                        className="flex-1 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        style={{ height: '56px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '15px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
                        <Play size={18} />
                        재시작
                      </button>
                      <button onClick={stopWalk}
                        className="rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        style={{ height: '56px', width: '80px', backgroundColor: '#F44336', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none' }}>
                        <Square size={16} />
                        종료
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Walk Done Summary */
            <div className="px-5 py-5 space-y-4">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)', boxShadow: '0 8px 24px rgba(27,75,140,0.3)' }}>
                  <span style={{ fontSize: '36px' }}>🎉</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2B5E' }}>산책 완료!</h2>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>코코와 함께 멋진 산책을 마쳤어요</p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
                <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>오늘의 산책 결과</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>2026년 4월 2일</p>
                </div>
                <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid #F5F5F5' }}>
                  {[
                    { icon: '⏱', label: '총 시간', value: formatTime(Math.max(stats.seconds, 5)) },
                    { icon: '📍', label: '이동 거리', value: formatDist(Math.max(stats.distanceM, 150)) },
                    { icon: '🔥', label: '칼로리', value: `${Math.max(Math.round(stats.calories), 18)}kcal` },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center py-4 px-2">
                      <span style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</span>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>{item.value}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                {/* Route snapshot */}
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <MapView progress={0.95} />
                </div>
              </div>

              {/* Calorie breakdown */}
              <div className="rounded-xl p-4" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '8px' }}>칼로리 소모 내역</p>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: '11px', color: '#0D2B5E' }}>코코 (28.5kg 강아지)</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C' }}>{Math.max(Math.round(stats.calories), 18)} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '11px', color: '#0D2B5E' }}>보호자 추산</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E6DB4' }}>{Math.max(Math.round(stats.calories * 4.5), 82)} kcal</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pb-2">
                <button className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ height: '50px', background: 'linear-gradient(135deg, #E91E63, #FF5722)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(233,30,99,0.3)' }}>
                  <Share2 size={16} />
                  인스타그램 공유하기
                </button>
                <button onClick={() => navigate('/home')}
                  className="w-full rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
                  style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
                  홈으로 →
                </button>
              </div>
            </div>
          )}
        </div>

        <BottomNav active="walk" />
      </div>
    </MobileFrame>
  );
}