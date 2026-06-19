// Geoapify Static Maps integration — free tier (3,000 req/day) needs no
// credit card. Sign up at https://www.geoapify.com → MyProjects → API key.
// The key sits in the URL by design; restrict it in Geoapify dashboard
// (MyProjects → API Keys → Edit → allowed referrers / origins).

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

export interface SnapshotPoint {
  lat: number;
  lng: number;
}

// Geoapify caps free tier raster output at ~1024 per side
const MAX_SIDE = 1024;

// URL length safety — downsample very long tracks
const MAX_POINTS = 120;

function downsample(points: SnapshotPoint[], max: number): SnapshotPoint[] {
  if (points.length <= max) return points;
  const stride = Math.ceil(points.length / max);
  const out: SnapshotPoint[] = [];
  for (let i = 0; i < points.length; i += stride) out.push(points[i]);
  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

function buildUrl(path: SnapshotPoint[], w: number, h: number): string | null {
  if (!GEOAPIFY_KEY) return null;
  if (path.length === 0) return null;

  const W = Math.min(w, MAX_SIDE);
  const H = Math.min(h, MAX_SIDE);
  const points = downsample(path, MAX_POINTS);

  const params = new URLSearchParams({
    apiKey: GEOAPIFY_KEY,
    width: String(W),
    height: String(H),
    style: 'osm-bright',
    lang: 'ko',
  });

  // Geoapify rejects uppercase hex color codes (400 "does not match any of
  // the allowed types"), so all colors here must be lowercase.
  if (points.length === 1) {
    const p = points[0];
    params.set('center', `lonlat:${p.lng},${p.lat}`);
    params.set('zoom', '16');
    params.append('marker', `lonlat:${p.lng},${p.lat};color:#1b4b8c;size:medium;type:circle`);
  } else {
    // Geoapify auto-fits the viewport to geometry+markers when neither
    // center nor zoom is supplied. Note: lng,lat order (opposite of Google).
    const coords = points.map(p => `${p.lng},${p.lat}`).join(',');
    params.append('geometry', `polyline:${coords};linecolor:#1b4b8c;linewidth:5`);
    const start = points[0];
    const end = points[points.length - 1];
    // Multiple markers must be combined into one `marker` param with `|`.
    const startMarker = `lonlat:${start.lng},${start.lat};color:#4caf50;size:medium;type:circle`;
    const endMarker = `lonlat:${end.lng},${end.lat};color:#f44336;size:medium;type:circle`;
    params.append('marker', `${startMarker}|${endMarker}`);
  }

  return `https://maps.geoapify.com/v1/staticmap?${params.toString()}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

// Returns a PNG dataURL, or null if the key is missing / Geoapify rejects
// the request / the network is down. Callers fall back to a local SVG.
// Geoapify sends CORS headers, so browser fetch + Blob → dataURL works
// without a backend proxy.
export async function fetchWalkSnapshot(
  path: SnapshotPoint[],
  w: number,
  h: number,
): Promise<string | null> {
  const url = buildUrl(path, w, h);
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}
