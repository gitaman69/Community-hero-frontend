import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner, { EmptyState } from '../components/Spinner.jsx';
import { Spotlight } from '../components/ui/spotlight.jsx';
import { Meteors } from '../components/ui/meteors.jsx';
import { fetchLeaderboard } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];

function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || '◍'
  );
}

function PodiumCard({ leader, place, isMe }) {
  const lift = { 1: 'sm:-mt-4', 2: 'sm:mt-6', 3: 'sm:mt-10' };
  const glow =
    place === 1
      ? 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.8)] border-signal/40'
      : place === 2
      ? 'border-civic/30'
      : 'border-white/10';
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (3 - place) * 0.1, type: 'spring', stiffness: 120, damping: 16 }}
      className={`relative flex-1 overflow-hidden rounded-2xl border bg-surface/70 p-5 text-center backdrop-blur ${lift[place]} ${glow} ${
        isMe ? 'ring-2 ring-civic' : ''
      }`}
    >
      {place === 1 ? <Meteors number={8} /> : null}
      {place === 1 ? (
        <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 animate-float text-3xl">
          👑
        </span>
      ) : null}
      <div className="relative z-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-xl font-semibold text-civic ring-1 ring-white/10">
          {initials(leader.name)}
        </div>
        <div className="mt-2 text-2xl">{MEDALS[place - 1]}</div>
        <p className="mt-1 truncate font-display text-sm font-semibold text-white">
          {leader.name}
          {isMe ? <span className="ml-1 text-civic">(you)</span> : null}
        </p>
        <p className="code mt-1 text-2xl font-bold tabular-nums text-gradient">
          {leader.points}
          <span className="ml-1 text-xs font-medium text-ink/45">pts</span>
        </p>
        <p className="code mt-1 text-[10px] uppercase tracking-widest text-ink/45">
          {leader.reports} reports · {leader.resolved} resolved
        </p>
      </div>
    </motion.div>
  );
}

function Row({ leader, isMe, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className={`border-b border-white/5 transition-colors last:border-0 hover:bg-white/5 ${
        isMe ? 'bg-civic/10' : ''
      }`}
    >
      <td className="px-3 py-3">
        <span className="code inline-grid h-7 w-7 place-items-center rounded-full bg-white/5 text-xs font-semibold tabular-nums text-ink/70">
          {leader.rank}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-civic/15 text-xs font-semibold text-civic ring-1 ring-civic/20">
            {initials(leader.name)}
          </span>
          <span className="truncate font-display text-sm font-medium text-white">
            {leader.name}
            {isMe ? <span className="ml-1.5 text-xs font-normal text-civic">you</span> : null}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="code text-sm font-bold tabular-nums text-civic">{leader.points}</span>
      </td>
      <td className="hidden px-3 py-3 text-right sm:table-cell">
        <span className="code text-sm tabular-nums text-ink/70">{leader.reports}</span>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="code text-sm tabular-nums text-verified">{leader.resolved}</span>
      </td>
      <td className="hidden px-3 py-3 text-right sm:table-cell">
        <span className="code text-sm tabular-nums text-ink/70">{leader.confirmations}</span>
      </td>
    </motion.tr>
  );
}

export default function Standings() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 20000,
  });

  const leaders = data?.leaders ?? [];
  const top3 = leaders.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const me = user?._id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 gradient-civic px-6 py-8 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.6)]">
        <Spotlight className="-top-20 left-10" fill="#6366f1" />
        <div className="pointer-events-none absolute -right-8 -top-12 text-[10rem] opacity-10">🏆</div>
        <div className="relative z-10">
          <div className="code text-[10px] uppercase tracking-widest text-ink/70">
            Civic Wayfinding · Standings
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
            Community <span className="shimmer-text">Heroes</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink/75">
            The neighbors doing the most to keep our streets working. Earn points by reporting
            issues — climb the board as they get resolved.
          </p>
          <Link to="/report" className="btn-signal mt-4 px-4 py-2 text-sm animate-glow-pulse">
            ＋ Report an issue
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Tallying the leaderboard…" />
        </div>
      ) : isError ? (
        <EmptyState icon="⚠" title="Couldn’t load standings">
          The API may be unreachable. Try again shortly.
        </EmptyState>
      ) : leaders.length === 0 ? (
        <EmptyState icon="🏅" title="No heroes yet">
          Be the first on the board —{' '}
          <Link to="/report" className="text-civic underline-offset-2 hover:underline">
            file a report
          </Link>{' '}
          and start earning points.
        </EmptyState>
      ) : (
        <>
          {podiumOrder.length > 0 ? (
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
              {podiumOrder.map((l) => (
                <PodiumCard key={l._id} leader={l} place={l.rank} isMe={l._id === me} />
              ))}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="font-display text-sm font-semibold text-white">Full ranking</h2>
              <span className="code text-[10px] uppercase tracking-widest text-ink/40">
                Top {leaders.length} · live
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-ink/45">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Hero</th>
                    <th className="px-3 py-2 text-right font-medium">Points</th>
                    <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Reports</th>
                    <th className="px-3 py-2 text-right font-medium">Resolved</th>
                    <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Confirms</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((l, i) => (
                    <Row key={l._id} leader={l} isMe={l._id === me} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="code mt-3 text-center text-[10px] uppercase tracking-widest text-ink/35">
            +10 points per report · refreshes automatically
          </p>
        </>
      )}
    </div>
  );
}
