import { useState } from 'react';
import { cn } from '../../lib/utils';

// A dark card with a mouse-following civic-blue spotlight (Aceternity "Card Spotlight" feel).
export function GlowCard({ children, className, spotlightColor = 'rgba(59,130,246,0.14)' }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/70 p-6 transition-colors duration-300 hover:border-white/20',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 42%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlowCard;
