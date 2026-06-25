import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Aceternity FlipWords — cycles through a list of words with a spring flip.
export function FlipWords({ words, duration = 2600, className }) {
  const [current, setCurrent] = useState(words[0]);
  const [animating, setAnimating] = useState(false);

  const next = useCallback(() => {
    const idx = words.indexOf(current);
    setCurrent(words[(idx + 1) % words.length]);
    setAnimating(true);
  }, [current, words]);

  useEffect(() => {
    if (animating) return undefined;
    const t = setTimeout(next, duration);
    return () => clearTimeout(t);
  }, [animating, duration, next]);

  return (
    <AnimatePresence onExitComplete={() => setAnimating(false)}>
      <motion.span
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40, x: 40, filter: 'blur(8px)', position: 'absolute' }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        className={cn('relative inline-block text-gradient', className)}
      >
        {current}
      </motion.span>
    </AnimatePresence>
  );
}

export default FlipWords;
