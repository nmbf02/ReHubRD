/**
 * ReHub brand mark — a "circle of support": a person at the centre, held by a
 * ring of three around them. It reads as a hub (Re·Hub) and echoes the
 * Círculo de apoyo. Original and warmer than a heartbeat; uses currentColor so
 * it inherits its chip's text color (white on the teal tile).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      role="img"
      aria-label="ReHub"
      className={className}
    >
      {/* ring of support */}
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      {/* three around */}
      <circle cx="14" cy="5" r="2.4" fill="currentColor" />
      <circle cx="6.2" cy="18.5" r="2.4" fill="currentColor" />
      <circle cx="21.8" cy="18.5" r="2.4" fill="currentColor" />
      {/* the person at the centre */}
      <circle cx="14" cy="14" r="3.3" fill="currentColor" />
    </svg>
  );
}
