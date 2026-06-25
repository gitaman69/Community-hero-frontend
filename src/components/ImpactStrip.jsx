import { Link } from 'react-router-dom';
import Spinner from './Spinner.jsx';

// Bottom impact strip: "X reported · Y resolved this week".
export default function ImpactStrip({ stats, loading }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-haze bg-paper/95 px-4 py-2 text-sm backdrop-blur">
      {loading ? (
        <Spinner size={14} label="Loading impact…" />
      ) : (
        <>
          <Stat value={stats?.total ?? 0} label="reported" tone="ink" />
          <span className="text-haze" aria-hidden="true">
            ·
          </span>
          <Stat value={stats?.open ?? 0} label="open now" tone="civic" />
          <span className="text-haze" aria-hidden="true">
            ·
          </span>
          <Stat
            value={stats?.resolvedThisWeek ?? 0}
            label="resolved this week"
            tone="verified"
          />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink/45 sm:inline">
              {stats?.resolved ?? 0} resolved all-time
            </span>
            <Link
              to="/standings"
              className="inline-flex items-center gap-1 rounded-full border border-haze px-2.5 py-0.5 text-xs text-ink/70 transition-colors hover:border-civic/40 hover:text-civic"
            >
              🏆 Standings
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ value, label, tone }) {
  const color =
    tone === 'verified'
      ? 'text-verified'
      : tone === 'civic'
      ? 'text-civic'
      : 'text-ink';
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span key={value} className={`code animate-scale-in text-lg font-medium tabular-nums ${color}`}>
        {value}
      </span>
      <span className="text-xs text-ink/60">{label}</span>
    </span>
  );
}
