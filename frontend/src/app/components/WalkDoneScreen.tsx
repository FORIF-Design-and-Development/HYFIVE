import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import { Share2, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { domToBlob } from 'modern-screenshot';
import { createWalk, WalkApiError, WalkNetworkError, type CreateWalkBody } from '../api/walks';

const KCAL_PER_KM = 14.25;
const CURRENT_PET_ID = 1;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export interface WalkDoneState {
  seconds: number;
  distanceM: number;
  startAt: string;
  endedAt: string;
  snapshotUrl: string | null;
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

function calories(distanceM: number) {
  return Math.round((distanceM / 1000) * KCAL_PER_KM);
}

function formatKoreanDate(localIso: string): string {
  const [y, m, d] = localIso.slice(0, 10).split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function WalkDoneScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as WalkDoneState | null;

  // No state → user hit /walk/done directly. Bounce home.
  if (!state) return <Navigate to="/home" replace />;

  return <WalkDoneContent state={state} navigate={navigate} />;
}

function WalkDoneContent({ state, navigate }: { state: WalkDoneState; navigate: ReturnType<typeof useNavigate> }) {
  const { seconds, distanceM, startAt, endedAt, snapshotUrl } = state;

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string>('');
  const summaryCardRef = useRef<HTMLDivElement | null>(null);

  const submitWalk = useCallback(async () => {
    setSubmitState('submitting');
    setSubmitError('');
    const body: CreateWalkBody = {
      petId: CURRENT_PET_ID,
      startAt,
      endedAt,
      distanceKm: Number((distanceM / 1000).toFixed(2)),
      calories: calories(distanceM),
    };
    try {
      await createWalk(body);
      setSubmitState('success');
    } catch (e) {
      let msg = '산책 기록 저장 중 오류가 발생했어요.';
      if (e instanceof WalkNetworkError) {
        msg = '백엔드 서버에 연결할 수 없어요. 서버가 켜져있는지 확인해주세요.';
      } else if (e instanceof WalkApiError) {
        if (e.status === 401) msg = '로그인이 만료됐어요. 다시 로그인해주세요.';
        else if (e.status === 422) msg = `입력값 오류: ${e.message}`;
        else if (e.status >= 500) msg = `서버 오류 (${e.status}). 잠시 후 다시 시도해주세요.`;
        else msg = e.message;
      }
      setSubmitState('error');
      setSubmitError(msg);
    }
  }, [startAt, endedAt, distanceM]);

  // Submit once on mount; ignore re-runs from StrictMode by using a ref guard
  const submittedRef = useRef(false);
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    void submitWalk();
  }, [submitWalk]);

  const shareSummary = useCallback(async () => {
    const node = summaryCardRef.current;
    if (!node) return;
    setIsSharing(true);
    setShareError('');
    try {
      const blob = await domToBlob(node, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      if (!blob) throw new Error('Snapshot blob is empty');

      const dateSlug = endedAt.slice(0, 10);
      const filename = `hyfive-walk-${dateSlug}.png`;

      const file = new File([blob], filename, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: '오늘의 산책 결과' });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      const aborted = e instanceof Error && e.name === 'AbortError';
      if (!aborted) {
        console.warn('Share failed', e);
        setShareError('공유에 실패했어요. 다시 시도해주세요.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [endedAt]);

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
          <div className="px-5 py-5 space-y-4">
            {/* Header */}
            <div className="text-center">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2B5E' }}>산책 완료!</h2>
              <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>코코와 함께 멋진 산책을 마쳤어요</p>
            </div>

            {/* Save status */}
            {submitState === 'submitting' && (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: '#1B4B8C' }} />
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1B4B8C' }}>산책 기록을 저장하는 중…</p>
              </div>
            )}
            {submitState === 'success' && (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4CAF50' }} />
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32' }}>산책 기록이 저장됐어요</p>
              </div>
            )}
            {submitState === 'error' && (
              <div className="rounded-xl p-3 flex items-start gap-3" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <AlertCircle size={16} style={{ color: '#C62828', flexShrink: 0, marginTop: '2px' }} />
                <div className="flex-1">
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#C62828' }}>저장에 실패했어요</p>
                  <p style={{ fontSize: '10px', color: '#B71C1C', marginTop: '2px' }}>{submitError}</p>
                </div>
                <button onClick={() => void submitWalk()}
                  className="rounded-lg px-2 py-1"
                  style={{ fontSize: '11px', fontWeight: 700, color: 'white', backgroundColor: '#C62828', border: 'none' }}>
                  재시도
                </button>
              </div>
            )}

            {/* Summary Card */}
            <div ref={summaryCardRef} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E0E0E0', backgroundColor: 'white' }}>
              <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1B4B8C, #2E6DB4)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>오늘의 산책 결과</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>{formatKoreanDate(endedAt)}</p>
              </div>
              <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid #F5F5F5' }}>
                {[
                  { icon: '⏱', label: '총 시간', value: formatTime(seconds) },
                  { icon: '📍', label: '이동 거리', value: formatDist(distanceM) },
                  { icon: '🔥', label: '칼로리', value: `${calories(distanceM)}kcal` },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center py-4 px-2">
                    <span style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</span>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#0D2B5E' }}>{item.value}</p>
                    <p style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '1px' }}>{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="relative flex items-center justify-center" style={{ height: '140px', overflow: 'hidden', backgroundColor: '#E8F0FA' }}>
                {snapshotUrl ? (
                  <img
                    src={snapshotUrl}
                    alt="산책 경로"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <span style={{ fontSize: '11px', color: '#6A9FD4', fontWeight: 600 }}>
                    지도 캡쳐에 실패했어요
                  </span>
                )}
              </div>
            </div>

            {/* Calorie breakdown */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C', marginBottom: '8px' }}>칼로리 소모 내역</p>
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '11px', color: '#0D2B5E' }}>코코 (28.5kg 강아지)</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B4B8C' }}>{calories(distanceM)} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '11px', color: '#0D2B5E' }}>보호자 추산</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E6DB4' }}>{Math.round(calories(distanceM) * 4.5)} kcal</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pb-2">
              <button onClick={() => void shareSummary()} disabled={isSharing}
                className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ height: '50px', background: 'linear-gradient(135deg, #E91E63, #FF5722)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(233,30,99,0.3)' }}>
                {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                {isSharing ? '이미지 생성 중…' : '공유하기 / PNG 저장'}
              </button>
              {shareError && (
                <p style={{ fontSize: '10px', color: '#C62828', textAlign: 'center', marginTop: '4px' }}>{shareError}</p>
              )}
              <button onClick={() => navigate('/home')}
                className="w-full rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
                style={{ height: '50px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
                홈으로 →
              </button>
            </div>
          </div>
        </div>

        <BottomNav active="walk" />
      </div>
    </MobileFrame>
  );
}
