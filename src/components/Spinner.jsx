export default function Spinner({ size = 20, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink/70" role="status" aria-live="polite">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}

export function EmptyState({ title, children, icon = '◇' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="text-3xl text-civic/50" aria-hidden="true">
        {icon}
      </div>
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {children ? <p className="max-w-xs text-sm text-ink/60">{children}</p> : null}
    </div>
  );
}
