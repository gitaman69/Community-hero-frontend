import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext.jsx';
import { cn } from '../lib/utils.js';
import Logo from './Logo.jsx';

function NavItem({ to, end, children }) {
  return (
    <NavLink to={to} end={end} className="relative px-3 py-1.5 text-sm font-medium outline-none">
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-full border border-white/10 bg-white/10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          ) : null}
          <span
            className={cn(
              'relative z-10 transition-colors',
              isActive ? 'text-white' : 'text-ink/60 hover:text-white'
            )}
          >
            {children}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Navbar({ areaCode }) {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/'); // back to the landing page
  };

  // Signed-in users get the full app nav.
  const appLinks = (
    <>
      <NavItem to="/map">Map</NavItem>
      <NavItem to="/analytics">Analytics</NavItem>
      <NavItem to="/standings">Standings</NavItem>
      <NavItem to="/my-reports">My reports</NavItem>
      {isAdmin ? <NavItem to="/admin">Admin</NavItem> : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-white/10 bg-paper/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="group flex items-center gap-2" aria-label="Community Hero home">
          <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-civic/10 ring-1 ring-civic/25 transition-transform group-hover:scale-110">
            <span className="absolute inset-0 animate-pulse-soft rounded-xl bg-civic/10" aria-hidden="true" />
            <Logo className="relative h-5 w-5" />
          </span>
          <span className="wordmark text-base text-white sm:text-lg">
            Community<span className="text-civic"> Hero</span>
          </span>
          {isAuthenticated && areaCode ? (
            <span className="code ml-1 hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] tracking-widest text-ink/45 lg:inline">
              {areaCode}
            </span>
          ) : null}
        </Link>

        {isAuthenticated ? (
          <nav className="ml-4 hidden items-center md:flex">{appLinks}</nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/report" className="btn-signal hidden px-3.5 py-1.5 text-sm sm:inline-flex">
                <span aria-hidden="true">＋</span> Report
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                {user?.points != null ? (
                  <Link
                    to="/standings"
                    className="code inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-ink/80 transition-colors hover:border-civic/40 hover:text-civic"
                    title="Your civic points"
                  >
                    <span aria-hidden="true">⭐</span>
                    {user.points}
                  </Link>
                ) : null}
                <span className="hidden text-xs text-ink/55 lg:inline">{user?.name}</span>
                <button type="button" onClick={handleLogout} className="btn-ghost px-2.5 py-1 text-xs">
                  Sign out
                </button>
              </div>
              {/* Mobile toggle (signed-in) */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="btn-ghost px-2 py-1.5 md:hidden"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                <span className="block text-base leading-none">{open ? '✕' : '☰'}</span>
              </button>
            </>
          ) : (
            <Link to="/login" state={{ from: location }} className="btn-civic px-4 py-1.5 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer (signed-in only) */}
      <AnimatePresence>
        {open && isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-b border-white/10 bg-paper/95 px-4 py-3 backdrop-blur-xl md:hidden"
            onClick={() => setOpen(false)}
          >
            <div className="flex flex-col gap-1 [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-2">
              {appLinks}
              <div className="mt-2 flex items-center gap-2">
                <Link to="/report" className="btn-signal flex-1 py-2 text-sm">
                  ＋ Report
                </Link>
                <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-2 text-sm">
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
