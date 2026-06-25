// Civic Night palette (mirrors CSS vars / tailwind theme)
export const COLORS = {
  ink: '#E6EDF6',
  paper: '#05070D',
  surface: '#0A0F1C',
  civic: '#3B82F6',
  signal: '#6366F1',
  verified: '#34D399',
  urgent: '#FB7185',
  haze: '#1E2A44',
};

// Default city center when geolocation is unavailable (Delhi).
export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
export const DEFAULT_ZOOM = 13;

// Categories the AI can assign. Used for filter chips & the admin editor.
export const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '◍' },
  { value: 'streetlight', label: 'Streetlight', icon: '✦' },
  { value: 'garbage', label: 'Garbage', icon: '⬡' },
  { value: 'water', label: 'Water', icon: '≈' },
  { value: 'sewage', label: 'Sewage', icon: '⊘' },
  { value: 'road', label: 'Road', icon: '▦' },
  { value: 'graffiti', label: 'Graffiti', icon: '✎' },
  { value: 'tree', label: 'Tree / Greenery', icon: '❦' },
  { value: 'other', label: 'Other', icon: '◇' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

export function categoryMeta(value) {
  if (!value) return { value: 'other', label: 'Uncategorized', icon: '◇' };
  return CATEGORY_MAP[value] || { value, label: titleCase(value), icon: '◇' };
}

// Lifecycle statuses. Everything that isn't resolved is "open".
export const STATUSES = [
  { value: 'pending', label: 'Pending', group: 'open' },
  { value: 'reported', label: 'Reported', group: 'open' },
  { value: 'assigned', label: 'Assigned', group: 'open' },
  { value: 'in_progress', label: 'In progress', group: 'open' },
  { value: 'resolved', label: 'Resolved', group: 'resolved' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

export const RESOLVED_STATUS = 'resolved';

// Severity threshold above which an open issue is treated as urgent (signal color).
export const URGENT_SEVERITY = 4;

export function isResolved(status) {
  return status === RESOLVED_STATUS;
}

export function isUrgent(issue) {
  if (!issue) return false;
  if (isResolved(issue.status)) return false;
  return Number(issue.severity) >= URGENT_SEVERITY;
}

// The single source of truth for pin/badge color given an issue.
export function issueColor(issue) {
  if (!issue) return COLORS.civic;
  if (isResolved(issue.status)) return COLORS.verified;
  if (isUrgent(issue)) return COLORS.urgent;
  return COLORS.civic;
}

export function titleCase(s = '') {
  return String(s)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function statusLabel(status) {
  return STATUS_MAP[status]?.label || titleCase(status || 'unknown');
}
