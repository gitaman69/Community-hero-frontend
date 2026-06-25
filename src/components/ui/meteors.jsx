import { cn } from '../../lib/utils';

// Aceternity Meteors — streaks falling diagonally across a dark surface.
export function Meteors({ number = 18, className }) {
  const meteors = new Array(number).fill(true);
  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-px before:w-[60px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-[#60a5fa] before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: 0,
            left: `${Math.floor(Math.random() * 800) - 400}px`,
            animationDelay: `${Math.random() * 0.6 + 0.2}s`,
            animationDuration: `${Math.floor(Math.random() * 8 + 4)}s`,
          }}
        />
      ))}
    </>
  );
}

export default Meteors;
