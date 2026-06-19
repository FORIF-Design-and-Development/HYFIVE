import { useState, useEffect } from 'react';

// Below this width we render full-screen (real phones, narrow windows, and
// react-native-webview embeds). At or above it we show the iPhone mockup
// frame — useful for desktop browsers viewing the deployed site.
const FRAME_MIN_WIDTH = 768;

// VITE_USE_MOBILE_FRAME=false forces full-screen everywhere (legacy WebView
// override). Otherwise the frame is shown only on wide (desktop) viewports.
export function useMobileFrame(): boolean {
  const envAllows = import.meta.env.VITE_USE_MOBILE_FRAME !== 'false';
  const [isWide, setIsWide] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= FRAME_MIN_WIDTH : false,
  );

  useEffect(() => {
    if (!envAllows) return;
    const onResize = () => setIsWide(window.innerWidth >= FRAME_MIN_WIDTH);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [envAllows]);

  return envAllows && isWide;
}
