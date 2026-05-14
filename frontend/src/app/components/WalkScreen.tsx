import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import BottomNav from './BottomNav';
import { Play, Pause, Square, ChevronLeft, Navigation, Timer, Footprints, Flame, AlertCircle, Loader2, MapPinOff } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import {
  loadKakaoMap,
  haversineMeters,
  SEOUL_CITY_HALL,
  type KakaoMap,
  type KakaoMarker,
  type KakaoPolyline,
} from '../lib/kakao-map';
import type { WalkDoneState } from './WalkDoneScreen';

// Discard GPS fixes worse than this (jitter inflates distance otherwise)
const ACCURACY_THRESHOLD_M = 50;
// Single-tick distance bounds — below = noise, above = bad fix / teleport
const MIN_SEGMENT_M = 2;
const MAX_SEGMENT_M = 200;

type WalkState = 'ready' | 'walking' | 'paused';
type GpsState =
  | 'loading'      // SDK / first fix still pending
  | 'ready'        // got an initial fix, idle
  | 'tracking'     // actively receiving watchPosition updates
  | 'denied'       // user denied permission
  | 'unsupported'  // geolocation API not available
  | 'unavailable'  // signal lost / position error
  | 'sdk-error';   // kakao SDK failed to load

// 28.5 kg dog @ casual walk ≈ 0.5 kcal / kg / km
const KCAL_PER_KM = 14.25;

interface WalkStats {
  seconds: number;
  distanceM: number;
  speedKmh: number; // current (last segment) speed
}

function formatSpeed(kmh: number) {
  if (kmh <= 0) return '0.0 km/h';
  return `${kmh.toFixed(1)} km/h`;
}

function formatPace(seconds: number, distanceM: number) {
  if (distanceM < 50) return '—';
  const secPerKm = seconds / (distanceM / 1000);
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"/km`;
}

function toLocalIso(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

function gpsLabel(state: GpsState): { text: string; tone: 'ok' | 'warn' | 'error' } {
  switch (state) {
    case 'tracking': return { text: 'GPS 추적 중', tone: 'ok' };
    case 'ready': return { text: 'GPS 신호 양호', tone: 'ok' };
    case 'loading': return { text: 'GPS 신호 확인 중…', tone: 'warn' };
    case 'denied': return { text: '위치 권한 거부됨', tone: 'error' };
    case 'unsupported': return { text: '위치 정보 미지원', tone: 'error' };
    case 'unavailable': return { text: 'GPS 신호 끊김', tone: 'warn' };
    case 'sdk-error': return { text: '지도 로드 실패', tone: 'error' };
  }
}

export default function WalkScreen() {
  const navigate = useNavigate();
  const [walkState, setWalkState] = useState<WalkState>('ready');
  const [stats, setStats] = useState<WalkStats>({ seconds: 0, distanceM: 0, speedKmh: 0 });
  const [gpsState, setGpsState] = useState<GpsState>('loading');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startAtRef = useRef<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const kakaoRef = useRef<Awaited<ReturnType<typeof loadKakaoMap>> | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const polylineRef = useRef<KakaoPolyline | null>(null);
  const pathRef = useRef<{ lat: number; lng: number; ts: number }[]>([]);
  const watchIdRef = useRef<number | null>(null);
  // Skip distance accumulation for the next segment (set after pause→resume)
  const skipNextSegmentRef = useRef<boolean>(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Bootstrap: load SDK + create map + try one geolocation fix
  useEffect(() => {
    let cancelled = false;

    loadKakaoMap()
      .then(kakao => {
        if (cancelled) return;
        kakaoRef.current = kakao;
        if (!mapContainerRef.current) return;
        const center = new kakao.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng);
        const map = new kakao.Map(mapContainerRef.current, { center, level: 3 });
        // Auto-tracking follows GPS; disable wheel/drag so the page can scroll
        // freely over the map area and the camera doesn't drift on input.
        map.setZoomable(false);
        map.setDraggable(false);
        mapRef.current = map;
        markerRef.current = new kakao.Marker({ position: center, map });
        const polyline = new kakao.Polyline({
          path: [],
          strokeWeight: 5,
          strokeColor: '#1B4B8C',
          strokeOpacity: 0.85,
          strokeStyle: 'solid',
        });
        polyline.setMap(map);
        polylineRef.current = polyline;

        if (!('geolocation' in navigator)) {
          setGpsState('unsupported');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            if (cancelled || !kakaoRef.current || !mapRef.current) return;
            const ll = new kakaoRef.current.LatLng(pos.coords.latitude, pos.coords.longitude);
            mapRef.current.setCenter(ll);
            markerRef.current?.setPosition(ll);
            setGpsState('ready');
          },
          err => {
            if (cancelled) return;
            setGpsState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
        );
      })
      .catch(e => {
        console.error('Kakao Map load failed', e);
        if (!cancelled) setGpsState('sdk-error');
      });

    return () => {
      cancelled = true;
      if (watchIdRef.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Re-measure the map after walkState changes (in case the parent layout shifts)
  useEffect(() => {
    mapRef.current?.relayout();
  }, [walkState]);

  const startWatch = useCallback(() => {
    if (!('geolocation' in navigator) || !kakaoRef.current) {
      setGpsState(prev => (prev === 'sdk-error' ? prev : 'unsupported'));
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const ts = pos.timestamp;
        const kakao = kakaoRef.current;
        if (!kakao || !mapRef.current) return;

        // Always show the marker — but only accumulate distance for good fixes
        const ll = new kakao.LatLng(latitude, longitude);
        mapRef.current.panTo(ll);
        markerRef.current?.setPosition(ll);
        setGpsState('tracking');

        if (accuracy != null && accuracy > ACCURACY_THRESHOLD_M) {
          // Bad fix — don't use for path/distance; just refresh the marker
          return;
        }

        const prev = pathRef.current[pathRef.current.length - 1];
        pathRef.current.push({ lat: latitude, lng: longitude, ts });
        polylineRef.current?.setPath(pathRef.current.map(p => new kakao.LatLng(p.lat, p.lng)));

        if (skipNextSegmentRef.current) {
          // First fix after resume — establish baseline without counting the gap
          skipNextSegmentRef.current = false;
          setStats(s => ({ ...s, speedKmh: 0 }));
          return;
        }

        if (!prev) return; // first ever fix — nothing to measure against

        const d = haversineMeters(prev.lat, prev.lng, latitude, longitude);
        if (d < MIN_SEGMENT_M || d >= MAX_SEGMENT_M) return;

        const dtSec = Math.max((ts - prev.ts) / 1000, 0.001);
        // Prefer the device-reported speed when available + sane; else derive
        const segmentKmh =
          speed != null && speed >= 0 && Number.isFinite(speed)
            ? speed * 3.6
            : (d / dtSec) * 3.6;

        setStats(s => ({
          ...s,
          distanceM: s.distanceM + Math.round(d),
          speedKmh: segmentKmh,
        }));
      },
      err => {
        setGpsState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
    watchIdRef.current = watchId;
  }, []);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const tick = () => {
    setStats(s => ({ ...s, seconds: s.seconds + 1 }));
  };

  const startWalk = () => {
    startAtRef.current = toLocalIso(new Date());
    setWalkState('walking');
    timerRef.current = setInterval(tick, 1000);
    startWatch();
  };

  const pauseWalk = () => {
    setWalkState('paused');
    if (timerRef.current) clearInterval(timerRef.current);
    stopWatch();
    setStats(s => ({ ...s, speedKmh: 0 }));
  };

  const resumeWalk = () => {
    setWalkState('walking');
    timerRef.current = setInterval(tick, 1000);
    skipNextSegmentRef.current = true; // don't count the gap during pause
    startWatch();
  };

  // Kakao tiles are cross-origin without CORS headers — modern-screenshot's
  // image inlining can hang indefinitely on them. Cap the snapshot at 5s so
  // 종료 always transitions the screen, capture or no capture.
  const SNAPSHOT_TIMEOUT_MS = 5000;

  const captureMapSnapshot = useCallback(async (): Promise<string | null> => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!container) return null;

    if (kakao && map && pathRef.current.length >= 2) {
      const bounds = new kakao.LatLngBounds();
      pathRef.current.forEach(p => bounds.extend(new kakao.LatLng(p.lat, p.lng)));
      if (!bounds.isEmpty()) map.setBounds(bounds);
    }

    await new Promise(r => setTimeout(r, 800));

    try {
      const snapshot = await Promise.race<string | null>([
        domToPng(container, { scale: 2 }),
        new Promise<null>(resolve => setTimeout(() => resolve(null), SNAPSHOT_TIMEOUT_MS)),
      ]);
      return snapshot ?? null;
    } catch (e) {
      console.warn('Map snapshot failed', e);
      return null;
    }
  }, []);

  // Detach Kakao overlays so the SDK stops drawing/fetching after 종료.
  // Navigation away from /walk will unmount the map div, but explicit detach
  // releases the SDK's internal listeners and pending tile requests right away.
  const teardownMap = useCallback(() => {
    if (watchIdRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    polylineRef.current?.setMap(null);
    markerRef.current?.setMap(null);
    polylineRef.current = null;
    markerRef.current = null;
    mapRef.current = null;
  }, []);

  const stopWalk = async () => {
    if (isCapturing) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopWatch();
    const endedAt = toLocalIso(new Date());
    const startAt = startAtRef.current ?? endedAt;
    setIsCapturing(true);
    let snapshotUrl: string | null = null;
    try {
      snapshotUrl = await captureMapSnapshot();
    } finally {
      teardownMap();
      setIsCapturing(false);
      const doneState: WalkDoneState = {
        seconds: stats.seconds,
        distanceM: stats.distanceM,
        startAt,
        endedAt,
        snapshotUrl,
      };
      navigate('/walk/done', { state: doneState, replace: true });
    }
  };

  const gps = gpsLabel(gpsState);
  const gpsBadgeBg =
    gps.tone === 'ok' ? 'rgba(27,75,140,0.85)'
    : gps.tone === 'warn' ? 'rgba(245,124,0,0.9)'
    : 'rgba(198,40,40,0.9)';

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
              {/* Map */}
              <div className="relative w-full overflow-hidden" style={{ height: '220px' }}>
                <div ref={mapContainerRef} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#E8F0FA' }} />
                {gpsState === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(232,240,250,0.85)' }}>
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" style={{ color: '#1B4B8C' }} />
                      <span style={{ fontSize: '12px', color: '#1B4B8C', fontWeight: 600 }}>지도 불러오는 중…</span>
                    </div>
                  </div>
                )}
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(13,43,94,0.55)' }}>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'white' }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: '#1B4B8C' }} />
                      <span style={{ fontSize: '12px', color: '#0D2B5E', fontWeight: 700 }}>경로 캡쳐 중…</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg flex items-center gap-1" style={{ backgroundColor: gpsBadgeBg }}>
                  {gps.tone === 'error' ? <MapPinOff size={10} style={{ color: 'white' }} /> : <Navigation size={10} style={{ color: 'white' }} />}
                  <span style={{ fontSize: '9px', color: 'white', fontWeight: 700 }}>{gps.text}</span>
                </div>
              </div>

              {/* GPS warning banner */}
              {(gpsState === 'denied' || gpsState === 'unsupported' || gpsState === 'sdk-error') && (
                <div className="mx-5 mt-3 rounded-xl p-3 flex items-start gap-3" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                  <AlertCircle size={16} style={{ color: '#C62828', flexShrink: 0, marginTop: '2px' }} />
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#C62828' }}>
                      {gpsState === 'denied' && '위치 권한이 거부됐어요'}
                      {gpsState === 'unsupported' && '이 기기에서 위치 정보를 쓸 수 없어요'}
                      {gpsState === 'sdk-error' && '지도를 불러오지 못했어요'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#B71C1C', marginTop: '2px', lineHeight: 1.5 }}>
                      {gpsState === 'denied' && '브라우저 설정 → 사이트 권한 → 위치 정보를 "허용"으로 바꾼 뒤 새로고침해주세요. 산책은 시작할 수 있지만 거리는 0으로 기록됩니다.'}
                      {gpsState === 'unsupported' && '거리/경로 없이 시간만 기록됩니다.'}
                      {gpsState === 'sdk-error' && '네트워크 상태와 카카오 키 도메인 설정을 확인해주세요.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Stats */}
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Timer size={18} style={{ color: '#1B4B8C' }} />, label: '시간', value: formatTime(stats.seconds) },
                    { icon: <Footprints size={18} style={{ color: '#2E6DB4' }} />, label: '거리', value: formatDist(stats.distanceM) },
                    { icon: <Flame size={18} style={{ color: '#F57C00' }} />, label: '칼로리', value: `${calories(stats.distanceM)}kcal` },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div className="flex justify-center mb-1">{item.icon}</div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2B5E' }}>{item.value}</p>
                      <p style={{ fontSize: '10px', color: '#9E9E9E' }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Speed / Pace */}
                {walkState !== 'ready' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                      <span style={{ fontSize: '10px', color: '#6A9FD4', fontWeight: 700 }}>현재 속도</span>
                      <span style={{ fontSize: '13px', color: '#0D2B5E', fontWeight: 700 }}>{formatSpeed(stats.speedKmh)}</span>
                    </div>
                    <div className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                      <span style={{ fontSize: '10px', color: '#6A9FD4', fontWeight: 700 }}>평균 페이스</span>
                      <span style={{ fontSize: '13px', color: '#0D2B5E', fontWeight: 700 }}>{formatPace(stats.seconds, stats.distanceM)}</span>
                    </div>
                  </div>
                )}

                {/* Status */}
                {walkState === 'ready' && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#E8F0FA', border: '1px solid #C5D8EE' }}>
                    <Navigation size={18} style={{ color: '#1B4B8C' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#0D2B5E' }}>시작 준비 완료</p>
                      <p style={{ fontSize: '10px', color: '#6A9FD4' }}>
                        {gpsState === 'ready' || gpsState === 'tracking'
                          ? 'GPS 신호를 확인했어요. 시작 버튼을 눌러주세요.'
                          : '위치 권한 없이 시작하면 거리는 기록되지 않아요.'}
                      </p>
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
                      <button onClick={pauseWalk} disabled={isCapturing}
                        className="flex-1 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
                        style={{ height: '56px', backgroundColor: 'white', border: '2px solid #1B4B8C', color: '#1B4B8C', fontSize: '15px', fontWeight: 700 }}>
                        <Pause size={18} />
                        일시정지
                      </button>
                      <button onClick={() => void stopWalk()} disabled={isCapturing}
                        className="rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-80"
                        style={{ height: '56px', width: '80px', backgroundColor: '#F44336', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none' }}>
                        {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                        {isCapturing ? '저장' : '종료'}
                      </button>
                    </>
                  )}
                  {walkState === 'paused' && (
                    <>
                      <button onClick={resumeWalk} disabled={isCapturing}
                        className="flex-1 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
                        style={{ height: '56px', background: 'linear-gradient(135deg, #1B4B8C 0%, #2E6DB4 100%)', color: 'white', fontSize: '15px', fontWeight: 700, border: 'none', boxShadow: '0 4px 16px rgba(27,75,140,0.3)' }}>
                        <Play size={18} />
                        재시작
                      </button>
                      <button onClick={() => void stopWalk()} disabled={isCapturing}
                        className="rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-80"
                        style={{ height: '56px', width: '80px', backgroundColor: '#F44336', color: 'white', fontSize: '13px', fontWeight: 700, border: 'none' }}>
                        {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} />}
                        {isCapturing ? '저장' : '종료'}
                      </button>
                    </>
                  )}
                </div>
              </div>
        </div>

        <BottomNav active="walk" />
      </div>
    </MobileFrame>
  );
}
