// Community Hero logo mark — a civic map-pin with a "you are here" node.
// Inline SVG so it scales crisply and inherits layout sizing via className.
export default function Logo({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      role="img"
      aria-label="Community Hero"
    >
      <defs>
        <linearGradient id="chLogoGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* teardrop pin */}
      <path
        d="M12 1.75c-4.28 0-7.75 3.47-7.75 7.75 0 5.43 6.24 11.46 7.28 12.42.27.25.67.25.94 0 1.04-.96 7.28-6.99 7.28-12.42 0-4.28-3.47-7.75-7.75-7.75z"
        fill="url(#chLogoGrad)"
      />
      {/* node hole */}
      <circle cx="12" cy="9.4" r="3.1" fill="#05070D" />
      <circle cx="12" cy="9.4" r="1.5" fill="#ffffff" />
    </svg>
  );
}
