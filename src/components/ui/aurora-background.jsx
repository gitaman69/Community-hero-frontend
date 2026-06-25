import { cn } from '../../lib/utils';

// Aceternity Aurora background wrapper. The animated gradient lives in
// the `.aurora-bg` CSS class (styles/index.css) for robustness.
export function AuroraBackground({ className, children, ...props }) {
  return (
    <div
      className={cn('relative flex flex-col items-center justify-center bg-paper text-ink', className)}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-bg" />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default AuroraBackground;
