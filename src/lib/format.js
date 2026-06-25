// Small formatting helpers — kept mono-friendly for codes/coordinates.

export function fmtCoord(lat, lng) {
  if (lat == null || lng == null) return '—';
  return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

// Derive lat/lng from a GeoJSON Point ([lng, lat]).
export function coordsFromIssue(issue) {
  const c = issue?.location?.coordinates;
  if (Array.isArray(c) && c.length === 2) {
    return { lng: Number(c[0]), lat: Number(c[1]) };
  }
  // Defensive: some payloads may send flat lat/lng.
  if (issue?.lat != null && issue?.lng != null) {
    return { lat: Number(issue.lat), lng: Number(issue.lng) };
  }
  return null;
}

export function fmtTimestamp(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function fmtRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

// Short mono "ward/area" code from coordinates — purely cosmetic wayfinding flavor.
export function areaCode(lat, lng) {
  if (lat == null || lng == null) return 'CH·00·00';
  const a = Math.abs(Math.round(lat * 100) % 100);
  const b = Math.abs(Math.round(lng * 100) % 100);
  const pad = (n) => String(n).padStart(2, '0');
  return `CH·${pad(a)}·${pad(b)}`;
}

// Normalize the detail endpoint which may be { issue, statusUpdates } or flat.
export function normalizeIssueDetail(data) {
  if (!data) return { issue: null, statusUpdates: [] };
  if (data.issue) {
    return {
      issue: data.issue,
      statusUpdates: Array.isArray(data.statusUpdates) ? data.statusUpdates : [],
    };
  }
  // Flat shape: the object itself is the issue.
  return {
    issue: data,
    statusUpdates: Array.isArray(data.statusUpdates) ? data.statusUpdates : [],
  };
}

// First usable image URL, prefixing the API host for relative paths.
export function issueImage(issue) {
  const url = issue?.imageUrls?.[0];
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
