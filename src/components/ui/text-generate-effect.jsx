import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'framer-motion';
import { cn } from '../../lib/utils';

// Aceternity Text Generate Effect — words fade + de-blur in sequence.
export function TextGenerateEffect({ words, className, filter = true, duration = 0.6 }) {
  const [scope, animate] = useAnimate();
  const wordsArray = String(words).split(' ');

  useEffect(() => {
    animate(
      'span',
      { opacity: 1, filter: filter ? 'blur(0px)' : 'none' },
      { duration, delay: stagger(0.1) }
    );
  }, [animate, duration, filter, words]);

  return (
    <span className={cn('inline', className)}>
      <motion.span ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="inline-block opacity-0"
            style={{ filter: filter ? 'blur(10px)' : 'none' }}
          >
            {word}&nbsp;
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}

export default TextGenerateEffect;
