import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Aceternity Hover Border Gradient — a light sweeps the border, snapping to
// the hovered edge and brightening to civic blue on hover.
const DIRECTIONS = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];

const MOVING = {
  TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)',
  LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)',
  BOTTOM: 'radial-gradient(20.7% 50% at 50% 100%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)',
  RIGHT: 'radial-gradient(16.2% 41.2% at 100% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)',
};
const HIGHLIGHT =
  'radial-gradient(75% 181% at 50% 50%, #3b82f6 0%, rgba(255,255,255,0) 100%)';

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  ...props
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState('TOP');

  useEffect(() => {
    if (hovered) return undefined;
    const id = setInterval(() => {
      setDirection((prev) => {
        const i = DIRECTIONS.indexOf(prev);
        const next = clockwise
          ? (i - 1 + DIRECTIONS.length) % DIRECTIONS.length
          : (i + 1) % DIRECTIONS.length;
        return DIRECTIONS[next];
      });
    }, duration * 1000);
    return () => clearInterval(id);
  }, [hovered, clockwise, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex h-min w-fit flex-col flex-nowrap content-center items-center justify-center gap-10 overflow-visible rounded-full border border-white/10 bg-white/5 p-px decoration-clone transition duration-500 hover:bg-white/10',
        containerClassName
      )}
      {...props}
    >
      <div className={cn('z-10 rounded-[inherit] bg-surface px-4 py-2 text-ink', className)}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
        style={{ filter: 'blur(2px)', width: '100%', height: '100%' }}
        initial={{ background: MOVING[direction] }}
        animate={{ background: hovered ? [MOVING[direction], HIGHLIGHT] : MOVING[direction] }}
        transition={{ ease: 'linear', duration }}
      />
      <div className="absolute inset-[2px] z-[1] flex-none rounded-full bg-surface" />
    </Tag>
  );
}

export default HoverBorderGradient;
