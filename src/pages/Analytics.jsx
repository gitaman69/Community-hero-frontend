import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { fetchTrends, fetchSla } from '../lib/api.js';
import { COLORS, STATUSES, categoryMeta, statusLabel } from '../lib/constants.js';

export default function Analytics() {
  const trendsQuery = useQuery({ queryKey: ['trends'], queryFn: fetchTrends });
  const slaQuery = useQuery({ queryKey: ['sla'], queryFn: fetchSla });

  const t = trendsQuery.data;
  const sla = slaQuery.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="code mb-1 text-[10px] uppercase tracking-widest text-civic">
        Civic Wayfinding · Analytics
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">City pulse</h1>
      <p className="mt-1 text-sm text-ink/60">
        Where issues cluster, how fast they get resolved, and what your community is reporting.
      </p>

      {trendsQuery.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner label="Crunching the numbers…" />
        </div>
      ) : trendsQuery.isError || !t ? (
        <div className="py-16">
          <EmptyState icon="⚠" title="Couldn’t load analytics">
            The API may be unreachable.{' '}
            <Link to="/map" className="text-civic underline-offset-2 hover:underline">
              Back to the map
            </Link>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total reports" value={t.total} />
            <StatCard label="Resolved" value={t.resolved} accent={COLORS.verified} />
            <StatCard label="Resolution rate" value={`${t.resolutionRate}%`} accent={COLORS.verified} />
            <StatCard
              label="Avg. resolution"
              value={sla?.overallAvgDays != null ? `${sla.overallAvgDays}d` : '—'}
              accent={COLORS.signal}
            />
          </div>

          {/* Trend chart */}
          <Panel title="Reports vs. resolutions" subtitle="Last 30 days">
            <TrendChart
              days={t.days}
              reported={t.reportedByDay}
              resolved={t.resolvedByDay}
            />
            <Legend
              items={[
                { color: COLORS.civic, label: 'Reported' },
                { color: COLORS.verified, label: 'Resolved' },
              ]}
            />
          </Panel>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="By category">
              <CategoryBars byCategory={t.byCategory} />
            </Panel>
            <Panel title="By status">
              <StatusBars byStatus={t.byStatus} />
            </Panel>
          </div>

          <Panel title="Hardest-hit areas" subtitle="Most-reported addresses">
            <TopAreas areas={t.topAreas} />
          </Panel>
        </>
      )}
    </div>
  );
}

// --- Building blocks -------------------------------------------------------

function StatCard({ label, value, accent }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="code text-[10px] uppercase tracking-widest text-ink/45">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold" style={{ color: accent || COLORS.ink }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-surface/60 p-4 backdrop-blur">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
        {subtitle ? (
          <span className="code text-[10px] uppercase tracking-widest text-ink/40">{subtitle}</span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Legend({ items }) {
  return (
    <div className="mt-2 flex flex-wrap gap-4">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-xs text-ink/60">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Dual-line area chart over a shared day axis. Pure SVG, responsive via viewBox.
function TrendChart({ days = [], reported = [], resolved = [] }) {
  const W = 640;
  const H = 200;
  const PAD = { top: 12, right: 8, bottom: 22, left: 28 };
  const n = days.length;
  const max = Math.max(1, ...reported, ...resolved);

  if (!n) return <p className="text-sm text-ink/50">No data yet.</p>;

  const x = (i) => PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, n - 1);
  const y = (v) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / max);

  const line = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const area = (arr) =>
    `${line(arr)} L${x(n - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;

  // A few horizontal gridlines + y labels.
  const ticks = 3;
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i));

  // Sparse x labels (about 5).
  const step = Math.max(1, Math.floor(n / 5));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[420px]" role="img">
        {gridY.map((g) => (
          <g key={g}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(g)}
              y2={y(g)}
              stroke={COLORS.haze}
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <text x={4} y={y(g) + 3} fill={COLORS.ink} fillOpacity="0.4" fontSize="9">
              {g}
            </text>
          </g>
        ))}

        <path d={area(reported)} fill={COLORS.civic} fillOpacity="0.12" />
        <path d={line(reported)} fill="none" stroke={COLORS.civic} strokeWidth="2" />
        <path d={line(resolved)} fill="none" stroke={COLORS.verified} strokeWidth="2" />

        {days.map((d, i) =>
          i % step === 0 || i === n - 1 ? (
            <text
              key={d}
              x={x(i)}
              y={H - 6}
              fill={COLORS.ink}
              fillOpacity="0.4"
              fontSize="9"
              textAnchor="middle"
            >
              {d.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

function CategoryBars({ byCategory = {} }) {
  const rows = Object.entries(byCategory)
    .map(([key, count]) => ({ key, count }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((r) => r.count));

  if (!rows.length) return <p className="text-sm text-ink/50">No reports yet.</p>;

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const cat = categoryMeta(r.key);
        return (
          <div key={r.key} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-xs text-ink/70">
              {cat.icon} {cat.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.count / max) * 100}%`, background: COLORS.civic }}
              />
            </div>
            <span className="code w-8 shrink-0 text-right text-xs text-ink/60">{r.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBars({ byStatus = {} }) {
  const order = STATUSES.map((s) => s.value);
  const rows = order
    .map((value) => ({ value, count: byStatus[value] || 0 }))
    .filter((r) => r.count > 0);
  const max = Math.max(1, ...rows.map((r) => r.count));

  if (!rows.length) return <p className="text-sm text-ink/50">No reports yet.</p>;

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const color = r.value === 'resolved' ? COLORS.verified : COLORS.signal;
        return (
          <div key={r.value} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-xs text-ink/70">
              {statusLabel(r.value)}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.count / max) * 100}%`, background: color }}
              />
            </div>
            <span className="code w-8 shrink-0 text-right text-xs text-ink/60">{r.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopAreas({ areas = [] }) {
  if (!areas.length) return <p className="text-sm text-ink/50">No located reports yet.</p>;
  return (
    <ol className="space-y-2">
      {areas.map((a, i) => (
        <li key={a.address} className="flex items-center gap-3">
          <span className="code w-5 shrink-0 text-center text-xs text-ink/40">{i + 1}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-ink/80" title={a.address}>
            {a.address}
          </span>
          <span className="code shrink-0 text-xs text-ink/55">
            {a.count} report{a.count === 1 ? '' : 's'}
            {a.resolved ? ` · ${a.resolved} resolved` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
