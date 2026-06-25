import { CATEGORIES, STATUSES } from '../lib/constants.js';

function Chip({ active, onClick, children, tone = 'civic' }) {
  const activeStyles =
    tone === 'verified'
      ? 'bg-verified text-paper border-verified shadow-[0_0_18px_-4px_rgba(52,211,153,0.7)]'
      : tone === 'signal'
      ? 'bg-signal text-white border-signal shadow-[0_0_18px_-4px_rgba(99,102,241,0.7)]'
      : 'bg-civic text-white border-civic shadow-[0_0_18px_-4px_rgba(59,130,246,0.7)]';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active ? activeStyles : 'border-white/10 bg-white/5 text-ink/70 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

// Controlled filters. `category` and `status` are single-select strings ('' = all).
export default function FilterChips({ category, status, onCategory, onStatus }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="code mb-1.5 text-[10px] uppercase tracking-widest text-ink/50">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!category} onClick={() => onCategory('')}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              active={category === c.value}
              onClick={() => onCategory(category === c.value ? '' : c.value)}
            >
              <span aria-hidden="true" className="mr-1">
                {c.icon}
              </span>
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="code mb-1.5 text-[10px] uppercase tracking-widest text-ink/50">Status</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!status} onClick={() => onStatus('')}>
            All
          </Chip>
          {STATUSES.map((s) => (
            <Chip
              key={s.value}
              tone={s.group === 'resolved' ? 'verified' : 'civic'}
              active={status === s.value}
              onClick={() => onStatus(status === s.value ? '' : s.value)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
