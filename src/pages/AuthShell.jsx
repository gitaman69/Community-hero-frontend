import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spotlight } from '../components/ui/spotlight.jsx';
import Logo from '../components/Logo.jsx';

// Shared chrome for the login / register pages — dark, with spotlight + grid.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper text-ink">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Spotlight className="-top-40 left-0 md:left-40" fill="#3b82f6" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-civic/20 blur-[120px]" />

      <header className="relative z-10 flex h-14 items-center px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-civic/10 ring-1 ring-civic/25">
            <Logo className="h-5 w-5" />
          </span>
          <span className="wordmark text-lg text-white">
            Community<span className="text-civic"> Hero</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="code mb-2 text-[10px] uppercase tracking-widest text-civic">
            Civic Wayfinding
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-ink/55">{subtitle}</p> : null}
          <div className="glass mt-6 rounded-2xl p-5 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.5)]">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
