import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { categoryMeta, isUrgent } from '../lib/constants.js';
import { coordsFromIssue, fmtCoord, fmtRelative, issueImage } from '../lib/format.js';

// A scannable feed card. `active` highlights the one tied to the selected pin.
// When `onDelete` is supplied a trash affordance appears (used in My Reports).
export default function IssueCard({ issue, active = false, onHover, onClick, onDelete, deleting = false }) {
  const cat = categoryMeta(issue.category);
  const coords = coordsFromIssue(issue);
  const img = issueImage(issue);
  const urgent = isUrgent(issue);

  return (
    <Link
      to={`/issues/${issue._id}`}
      onMouseEnter={() => onHover?.(issue._id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(issue._id)}
      className={`group relative block animate-fade-in rounded-xl border bg-surface/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(59,130,246,0.6)] ${
        active
          ? 'border-civic shadow-[0_0_0_1px_rgba(59,130,246,0.4)]'
          : 'border-white/10 hover:border-civic/50'
      }`}
    >
      {onDelete ? (
        <button
          type="button"
          aria-label="Delete report"
          disabled={deleting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(issue);
          }}
          className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md border border-transparent text-ink/30 opacity-0 transition-all hover:border-signal/30 hover:bg-signal/10 hover:text-signal focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
          title="Delete this report"
        >
          {deleting ? (
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-signal/30 border-t-signal" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6m4 5v6m6-6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ) : null}
      <div className="flex gap-3">
        <div
          className="map-shell flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md text-xl text-civic/60"
          aria-hidden={!!img}
        >
          {img ? (
            <img
              src={img}
              alt={issue.title || cat.label}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{cat.icon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-sm font-medium text-ink">
              {issue.title || (issue.aiProcessed ? cat.label : 'Analyzing…')}
            </h3>
            <StatusBadge status={issue.status} urgent={urgent} />
          </div>

          <p className="mt-0.5 line-clamp-2 text-xs text-ink/60">
            {issue.description ||
              (issue.aiProcessed ? 'No description.' : 'Awaiting AI categorization…')}
          </p>

          <div className="code mt-1.5 flex items-center gap-2 text-[10px] text-ink/45">
            <span className="uppercase tracking-wide">{cat.icon} {cat.label}</span>
            <span aria-hidden="true">·</span>
            <span>{coords ? fmtCoord(coords.lat, coords.lng) : '—'}</span>
            {issue.createdAt ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{fmtRelative(issue.createdAt)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
