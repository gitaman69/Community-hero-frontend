import { isResolved, statusLabel, COLORS } from '../lib/constants.js';

// A status badge whose color follows the same rules as the map pins.
// `urgent` (high severity, still open) pushes the badge to signal vermilion.
export default function StatusBadge({ status, urgent = false, className = '' }) {
  let color = COLORS.civic;
  let bg = 'rgba(59, 130, 246, 0.14)';

  if (isResolved(status)) {
    color = COLORS.verified;
    bg = 'rgba(52, 211, 153, 0.14)';
  } else if (urgent) {
    color = COLORS.urgent;
    bg = 'rgba(251, 113, 133, 0.14)';
  }

  return (
    <span
      className={`code inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {statusLabel(status)}
    </span>
  );
}
