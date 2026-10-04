export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="8" width="14" height="8" rx="2" />
      <circle cx="8" cy="4" r="1.5" fill="currentColor" />
      <circle cx="16" cy="4" r="1.5" fill="currentColor" />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" />
      <circle cx="16" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
