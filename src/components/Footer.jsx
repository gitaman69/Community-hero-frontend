import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const COL_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Live map', to: '/map' },
      { label: 'Report an issue', to: '/report' },
      { label: 'Standings', to: '/standings' },
      { label: 'My reports', to: '/my-reports' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'How it works', to: '/' },
      { label: 'Leaderboard', to: '/standings' },
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-paper">
      <div className="pointer-events-none absolute inset-0 bg-dot opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-civic/20 blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-civic/10 ring-1 ring-civic/25">
              <Logo className="h-6 w-6" />
            </span>
            <span className="wordmark text-lg text-white">
              Community<span className="text-civic"> Hero</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink/55">
            A live civic map for your neighborhood. Snap a photo, drop a pin, and watch your
            community fix what's broken — one report at a time.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {['𝕏', 'in', 'gh'].map((s) => (
              <span
                key={s}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xs text-ink/60 transition-colors hover:border-civic/40 hover:text-civic"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {COL_LINKS.map((col) => (
          <div key={col.title}>
            <h3 className="code text-[11px] uppercase tracking-widest text-ink/40">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-ink/60 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-ink/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Community Hero. Built for better neighborhoods.</p>
          <p className="code">Map your city · Fix your block</p>
        </div>
      </div>
    </footer>
  );
}
