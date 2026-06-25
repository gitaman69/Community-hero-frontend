import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

// Count-up number that animates when scrolled into view.
export function NumberTicker({ value = 0, className }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 36, stiffness: 120 });
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  useEffect(() => {
    if (inView) motionValue.set(Number(value) || 0);
  }, [inView, value, motionValue]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat('en-US').format(Math.round(latest));
        }
      }),
    [spring]
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

export default NumberTicker;
