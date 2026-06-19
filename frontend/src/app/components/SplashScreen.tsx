import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LionMark } from './LionMark';
import { useMobileFrame } from '../lib/useMobileFrame';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'logo' | 'ready'>('logo');
  const useFrame = useMobileFrame();

  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 1200);
    return () => clearTimeout(t);
  }, []);

  const content = (
    <div
      className="relative h-full w-full flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0D2B5E 0%, #1B4B8C 35%, #2E6DB4 65%, #6A9FD4 100%)' }}
    >
      {useFrame && (
        /* Dynamic Island (desktop preview only) */
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
          style={{ width: '126px', height: '34px', backgroundColor: '#000', borderRadius: '0 0 22px 22px' }}>
          <div className="absolute right-[22px] top-[14px] w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: '#1a2a3a', boxShadow: '0 0 8px rgba(100,149,237,0.4)' }} />
        </div>
      )}

      {/* Status bar */}
      <div className="flex-shrink-0 flex items-end justify-between px-5" style={{ height: '56px', paddingBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.3px' }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-[2px] items-end" style={{ height: '11px' }}>
            {[4, 6, 8, 10].map((h, i) => (
              <div key={i} style={{ width: '3px', height: `${h}px`, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1px' }} />
            ))}
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5Z" fill="rgba(255,255,255,0.9)"/>
            <path d="M4.5 7C5.7 5.8 7 5.2 8 5.2C9 5.2 10.3 5.8 11.5 7" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M1.5 4C3.3 2 5.5 1 8 1C10.5 1 12.7 2 14.5 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          <div className="flex items-center gap-[1px]">
            <div style={{ width: '23px', height: '11px', border: '1.5px solid rgba(255,255,255,0.9)', borderRadius: '3px', padding: '1.5px' }}>
              <div style={{ width: '78%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '1.5px' }} />
            </div>
            <div style={{ width: '2px', height: '5px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '0 1px 1px 0', marginLeft: '1px' }} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
        <div className="flex flex-col items-center" style={{ gap: '24px' }}>
          <div className="relative flex items-center justify-center" style={{
            width: '180px', height: '180px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.10)',
            boxShadow: '0 0 60px rgba(255,255,255,0.12), 0 0 120px rgba(106,159,212,0.25)',
          }}>
            <div style={{
              opacity: phase === 'logo' ? 0 : 1,
              transform: phase === 'logo' ? 'scale(0.82)' : 'scale(1)',
              transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <LionMark size={120} color="white" />
            </div>
          </div>

          <div className="text-center" style={{ opacity: phase === 'logo' ? 0 : 1, transition: 'opacity 0.5s ease 0.25s' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: 'white', letterSpacing: '8px', lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.2)', fontFamily: "'Nunito', sans-serif" }}>
              HYFIVE
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '8px', letterSpacing: '1px' }}>
              AI 반려동물 건강 통합 관리
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-8 right-8"
          style={{ opacity: phase === 'logo' ? 0 : 1, transition: 'opacity 0.5s ease 0.45s' }}>
          <button onClick={() => navigate('/login')}
            className="w-full rounded-2xl transition-all active:scale-[0.97]"
            style={{ height: '54px', backgroundColor: 'white', color: '#1B4B8C', fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer' }}>
            시작하기
          </button>
        </div>
      </div>

      <div className="absolute" style={{ width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: '-80px', right: '-100px', pointerEvents: 'none' }} />
      <div className="absolute" style={{ width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', bottom: '40px', left: '-60px', pointerEvents: 'none' }} />
    </div>
  );

  if (!useFrame) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEF2F8' }}>
      <div className="relative" style={{ width: '393px', height: '852px' }}>
        <div
          className="absolute inset-0 rounded-[56px] shadow-2xl overflow-hidden"
          style={{ border: '12px solid #1C1C1C', backgroundColor: '#1C1C1C' }}
        >
          {content}
        </div>
        <div className="absolute left-0 top-[140px] w-[3px] h-[50px] rounded-r" style={{ backgroundColor: '#555' }} />
        <div className="absolute left-0 top-[200px] w-[3px] h-[50px] rounded-r" style={{ backgroundColor: '#555' }} />
        <div className="absolute right-0 top-[180px] w-[3px] h-[80px] rounded-l" style={{ backgroundColor: '#555' }} />
      </div>
    </div>
  );
}
