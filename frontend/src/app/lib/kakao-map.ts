export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  panTo(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  setLevel(level: number): void;
  relayout(): void;
  setBounds(bounds: KakaoLatLngBounds): void;
  setZoomable(zoomable: boolean): void;
  setDraggable(draggable: boolean): void;
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
  isEmpty(): boolean;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
}

export interface KakaoPolyline {
  setMap(map: KakaoMap | null): void;
  setPath(path: KakaoLatLng[]): void;
}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level?: number },
  ) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: {
    position: KakaoLatLng;
    map?: KakaoMap;
    image?: unknown;
  }) => KakaoMarker;
  Polyline: new (options: {
    path: KakaoLatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
  }) => KakaoPolyline;
  LatLngBounds: new () => KakaoLatLngBounds;
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsNamespace };
  }
}

let loadPromise: Promise<KakaoMapsNamespace> | null = null;

export class KakaoMapLoadError extends Error {
  constructor(public reason: 'missing-key' | 'script-error' | 'timeout', message: string) {
    super(message);
    this.name = 'KakaoMapLoadError';
  }
}

export function loadKakaoMap(): Promise<KakaoMapsNamespace> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao!.maps));
      return;
    }

    const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!appkey) {
      reject(new KakaoMapLoadError('missing-key', 'VITE_KAKAO_MAP_KEY is not set'));
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new KakaoMapLoadError('timeout', 'Kakao Map SDK load timed out (10s)'));
    }, 10000);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      if (!window.kakao?.maps) {
        reject(new KakaoMapLoadError('script-error', 'Kakao SDK loaded but window.kakao.maps is missing'));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao!.maps));
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(
        new KakaoMapLoadError(
          'script-error',
          'Kakao SDK script failed to load — domain likely not whitelisted in Kakao Developers console',
        ),
      );
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

// Haversine — meters between two WGS84 points
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Seoul City Hall — fallback when geolocation is unavailable
export const SEOUL_CITY_HALL = { lat: 37.5666805, lng: 126.9784147 };
