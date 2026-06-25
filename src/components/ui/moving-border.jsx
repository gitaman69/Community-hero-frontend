import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { cn } from '../../lib/utils';

// Aceternity "Button with a moving border" — a light orbits the border.
export function MovingBorderButton({
  borderRadius = '1.25rem',
  children,
  as: Component = 'button',
  containerClassName,
  borderClassName,
  duration = 2800,
  className,
  ...props
}) {
  return (
    <Component
      className={cn('relative overflow-hidden bg-transparent p-[1.5px]', containerClassName)}
      style={{ borderRadius }}
      {...props}
    >
      <div className="absolute inset-0" style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              'h-24 w-24 bg-[radial-gradient(#3b82f6_40%,transparent_60%)] opacity-80',
              borderClassName
            )}
          />
        </MovingBorder>
      </div>
      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center border border-white/10 bg-surface/80 text-sm font-medium text-ink antialiased backdrop-blur-xl',
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({ children, duration = 2800, rx, ry, ...rest }) => {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength?.();
    if (length) {
      const pxPerMs = length / duration;
      progress.set((time * pxPerMs) % length);
    }
  });

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength?.(val)?.x ?? 0);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength?.(val)?.y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...rest}
      >
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div
        style={{ position: 'absolute', top: 0, left: 0, display: 'inline-block', transform }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default MovingBorderButton;
