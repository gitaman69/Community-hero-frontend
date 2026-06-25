import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Spotlight } from '../components/ui/spotlight.jsx';
import { Meteors } from '../components/ui/meteors.jsx';
import { WorldMap } from '../components/ui/world-map.jsx';
import { FlipWords } from '../components/ui/flip-words.jsx';
import { TextGenerateEffect } from '../components/ui/text-generate-effect.jsx';
import { NumberTicker } from '../components/ui/number-ticker.jsx';
import { MovingBorderButton } from '../components/ui/moving-border.jsx';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient.jsx';
import { GlowCard } from '../components/ui/glow-card.jsx';
import { BentoGrid, BentoGridItem } from '../components/ui/bento-grid.jsx';
import { fetchIssues, fetchStats } from '../lib/api.js';
import { coordsFromIssue } from '../lib/format.js';
import { issueColor } from '../lib/constants.js';
import { useAuth } from '../lib/AuthContext.jsx';

const SEED = {
  delhi: { lat: 28.61, lng: 77.2 },
  london: { lat: 51.5, lng: -0.12 },
  ny: { lat: 40.71, lng: -74.0 },
  tokyo: { lat: 35.68, lng: 139.69 },
  sf: { lat: 37.77, lng: -122.41 },
  saopaulo: { lat: -23.55, lng: -46.63 },
};

const DECOR_ARCS = [
  { start: SEED.delhi, end: SEED.london },
  { start: SEED.london, end: SEED.ny },
  { start: SEED.ny, end: SEED.sf },
  { start: SEED.delhi, end: SEED.tokyo },
  { start: SEED.saopaulo, end: SEED.ny },
];

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { data: issuesData } = useQuery({ queryKey: ['issues', 'landing'], queryFn: () => fetchIssues({}) });
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: fetchStats });

  // Guests are driven through auth; members go straight into the app.
  const primaryTo = isAuthenticated ? '/map' : '/register';
  const secondaryTo = isAuthenticated ? '/report' : '/login';

  const reportPoints = useMemo(() => {
    const issues = issuesData ?? [];
    return issues
      .map((it) => {
        const c = coordsFromIssue(it);
        return c ? { lat: c.lat, lng: c.lng, color: issueColor(it) } : null;
      })
      .filter(Boolean)
      .slice(0, 60);
  }, [issuesData]);

  // Arcs: connect a few real reports if we have them, else decorative globe arcs.
  const arcs = useMemo(() => {
    if (reportPoints.length >= 3) {
      const hub = reportPoints[0];
      const real = reportPoints
        .slice(1, 6)
        .map((p) => ({ start: hub, end: p }));
      return [...real, DECOR_ARCS[0], DECOR_ARCS[1]];
    }
    return DECOR_ARCS;
  }, [reportPoints]);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[86vh] w-full items-center overflow-hidden bg-paper">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#3b82f6" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-civic/20 blur-[140px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink/70 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-verified" />
            </span>
            Live civic reporting · powered by AI
          </motion.div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Map your city.
            <br className="hidden sm:block" />{' '}
            <FlipWords
              words={['Fix your block.', 'Report potholes.', 'Light the streets.', 'Clear the drains.']}
              className="font-bold"
            />
          </h1>

          <div className="mt-6 max-w-2xl text-base text-ink/65 sm:text-lg">
            <TextGenerateEffect words="Snap a photo, drop a pin, and let AI sort the rest. Every report lands on a live map and gets tracked all the way to resolved." />
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <MovingBorderButton
              as={Link}
              to={primaryTo}
              containerClassName="h-12 w-56"
              className="font-semibold"
            >
              {isAuthenticated ? '🗺️ Open the live map' : '🚀 Get started — free'}
            </MovingBorderButton>
            <HoverBorderGradient as={Link} to={secondaryTo} className="text-sm font-medium">
              {isAuthenticated ? '＋ Report an issue' : 'Sign in'}
            </HoverBorderGradient>
          </div>

          <p className="code mt-8 text-[11px] uppercase tracking-widest text-ink/35">
            No app to install · works on any phone
          </p>
        </div>
      </section>

      {/* ============ WORLD MAP ============ */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <div className="code text-[11px] uppercase tracking-widest text-civic">Live network</div>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
            Every report, on one living map
          </h2>
          <p className="mt-3 text-ink/55">
            Each pulse is a real issue your neighbors flagged. Watch the city light up as problems
            get reported — and go dark as they're resolved.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-3xl border border-white/10 bg-surface/40 p-3 shadow-[0_40px_120px_-40px_rgba(59,130,246,0.5)] sm:p-6">
            <WorldMap dots={arcs} points={reportPoints} lineColor="#3b82f6" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink/55">
              <Legend color="#3b82f6" label="Open report" />
              <Legend color="#FB7185" label="Urgent" />
              <Legend color="#34D399" label="Resolved" />
              <span className="code text-ink/40">
                {reportPoints.length} live point{reportPoints.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard value={stats?.total ?? 0} label="Issues reported" tone="text-white" />
          <StatCard value={stats?.resolved ?? 0} label="Resolved all-time" tone="text-verified" />
          <StatCard value={stats?.open ?? 0} label="Open right now" tone="text-civic" />
        </div>
      </section>

      {/* ============ FEATURES (BENTO) ============ */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <div className="code text-[11px] uppercase tracking-widest text-civic">Why it works</div>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
            Built to make reporting effortless
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <BentoGrid>
            <BentoGridItem
              className="md:col-span-2"
              header={<MiniMapHeader points={reportPoints} arcs={arcs} />}
              icon={<span className="text-2xl">🛰️</span>}
              title="A live map of your neighborhood"
              description="Reports drop as glowing pins in real time, color-coded by urgency and status."
            />
            <BentoGridItem
              header={<GradientHeader emoji="🤖" />}
              icon={<span className="text-2xl">🤖</span>}
              title="AI does the paperwork"
              description="Gemini categorizes, titles, and rates every photo — you just snap and submit."
            />
            <BentoGridItem
              header={<GradientHeader emoji="🏆" />}
              icon={<span className="text-2xl">🏆</span>}
              title="Earn civic points"
              description="Climb the Community Heroes leaderboard as your reports get resolved."
            />
            <BentoGridItem
              className="md:col-span-2"
              header={<TimelineHeader />}
              icon={<span className="text-2xl">📍</span>}
              title="Track it to resolved"
              description="Follow each issue through reported → assigned → in progress → resolved, with a full timeline."
            />
          </BentoGrid>
        </Reveal>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative mx-auto max-w-5xl px-6 py-20">
        <Reveal className="mb-12 text-center">
          <div className="code text-[11px] uppercase tracking-widest text-civic">Three steps</div>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
            From pothole to fixed
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: '01', t: 'Snap & pin', d: 'Take a photo. Your GPS auto-fills the location. Submit in seconds.' },
            { n: '02', t: 'AI sorts it', d: 'Gemini categorizes and rates the issue, then it lands on the live map.' },
            { n: '03', t: 'Watch it resolve', d: 'Admins advance the status. You get a transparent, tracked timeline.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <GlowCard className="h-full">
                <div className="code text-3xl font-bold text-civic/40">{s.n}</div>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-ink/55">{s.d}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 gradient-civic p-10 text-center sm:p-16">
            <Meteors number={14} />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Your block has a problem. Be its hero.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-ink/70">
                Join your neighbors mapping and fixing the city — one report at a time.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to={primaryTo} className="btn-signal px-6 py-3 text-base animate-glow-pulse">
                  {isAuthenticated ? '＋ Report an issue' : '🚀 Create your free account'}
                </Link>
                <Link to={secondaryTo} className="btn-ghost px-6 py-3 text-base">
                  {isAuthenticated ? 'Explore the map →' : 'Sign in →'}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}

function StatCard({ value, label, tone }) {
  return (
    <GlowCard className="text-center">
      <div className={`code text-4xl font-bold tabular-nums ${tone}`}>
        <NumberTicker value={value} />
      </div>
      <div className="mt-1 text-sm text-ink/55">{label}</div>
    </GlowCard>
  );
}

function GradientHeader({ emoji }) {
  return (
    <div className="relative flex h-full min-h-[6rem] w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-civic/20 via-surface to-signal/10">
      <span className="animate-float text-4xl opacity-80">{emoji}</span>
    </div>
  );
}

function MiniMapHeader({ points, arcs }) {
  return (
    <div className="relative h-full min-h-[7rem] w-full overflow-hidden rounded-xl border border-white/5 bg-paper">
      <WorldMap dots={arcs.slice(0, 3)} points={points.slice(0, 30)} lineColor="#3b82f6" className="aspect-auto h-full" />
    </div>
  );
}

function TimelineHeader() {
  const steps = ['Reported', 'Assigned', 'In progress', 'Resolved'];
  return (
    <div className="flex h-full min-h-[6rem] w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-surface px-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${i === steps.length - 1 ? 'bg-verified' : 'bg-civic'}`}
            />
            <span className="hidden text-[9px] text-ink/45 sm:block">{s}</span>
          </div>
          {i < steps.length - 1 ? <span className="h-px w-6 bg-white/15" /> : null}
        </div>
      ))}
    </div>
  );
}
