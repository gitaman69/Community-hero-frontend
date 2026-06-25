import { cn } from '../../lib/utils';

// Aceternity Bento Grid — a responsive feature grid with hover lift.
export function BentoGrid({ className, children }) {
  return (
    <div
      className={cn(
        'mx-auto grid max-w-5xl grid-cols-1 gap-4 md:auto-rows-[16rem] md:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({ className, title, description, header, icon }) {
  return (
    <div
      className={cn(
        'group/bento row-span-1 flex flex-col justify-between space-y-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/70 p-5 transition duration-200 hover:-translate-y-1 hover:border-civic/40 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.7)]',
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        <div className="mb-1 mt-2 font-display text-base font-semibold text-ink">{title}</div>
        <div className="text-sm text-ink/55">{description}</div>
      </div>
    </div>
  );
}

export default BentoGrid;
