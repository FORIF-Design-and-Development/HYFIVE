import { ReactNode } from 'react';
import { useMobileFrame } from '../lib/useMobileFrame';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const useFrame = useMobileFrame();

  if (!useFrame) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#EEF2F8' }}>
      {/* iPhone 15 Pro Frame */}
      <div className="relative" style={{ width: '393px', height: '852px' }}>
        {/* Device Frame */}
        <div className="absolute inset-0 rounded-[56px] shadow-2xl overflow-hidden" style={{ 
          border: '12px solid #1C1C1C',
          backgroundColor: '#1C1C1C'
        }}>
          {/* Full screen area */}
          <div className="relative h-full w-full overflow-hidden flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
            
            {/* Status Bar with Dynamic Island */}
            <div className="flex-shrink-0 relative bg-white" style={{ height: '56px' }}>
              {/* Dynamic Island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50" style={{
                width: '126px',
                height: '34px',
                backgroundColor: '#000',
                borderRadius: '0 0 22px 22px',
              }}>
                {/* Camera dot */}
                <div className="absolute right-[22px] top-[14px] w-[6px] h-[6px] rounded-full" style={{
                  backgroundColor: '#1a2a3a',
                  boxShadow: '0 0 8px rgba(100, 149, 237, 0.4)'
                }}></div>
              </div>
              
              {/* Status bar content (bottom portion) */}
              <div className="absolute bottom-0 left-0 right-0 px-5 flex items-center justify-between" style={{ height: '22px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1C', letterSpacing: '-0.3px' }}>9:41</span>
                <div className="flex items-center gap-1.5">
                  {/* Signal bars */}
                  <div className="flex gap-[2px] items-end" style={{ height: '11px' }}>
                    {[4, 6, 8, 10].map((h, i) => (
                      <div key={i} style={{ width: '3px', height: `${h}px`, backgroundColor: '#1C1C1C', borderRadius: '1px' }} />
                    ))}
                  </div>
                  {/* WiFi icon */}
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11C9.5 11.83 8.83 12.5 8 12.5C7.17 12.5 6.5 11.83 6.5 11C6.5 10.17 7.17 9.5 8 9.5Z" fill="#1C1C1C"/>
                    <path d="M4.5 7C5.7 5.8 7 5.2 8 5.2C9 5.2 10.3 5.8 11.5 7" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M1.5 4C3.3 2 5.5 1 8 1C10.5 1 12.7 2 14.5 4" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center gap-[1px]">
                    <div style={{ width: '23px', height: '11px', border: '1.5px solid #1C1C1C', borderRadius: '3px', padding: '1.5px' }}>
                      <div style={{ width: '78%', height: '100%', backgroundColor: '#1C1C1C', borderRadius: '1.5px' }} />
                    </div>
                    <div style={{ width: '2px', height: '5px', backgroundColor: '#1C1C1C', borderRadius: '0 1px 1px 0', marginLeft: '1px' }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Page Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {children}
            </div>
          </div>
        </div>
        
        {/* Volume Buttons */}
        <div className="absolute left-0 top-[140px] w-[3px] h-[50px] rounded-r" style={{ backgroundColor: '#555' }}></div>
        <div className="absolute left-0 top-[200px] w-[3px] h-[50px] rounded-r" style={{ backgroundColor: '#555' }}></div>
        
        {/* Power Button */}
        <div className="absolute right-0 top-[180px] w-[3px] h-[80px] rounded-l" style={{ backgroundColor: '#555' }}></div>
      </div>
    </div>
  );
}
