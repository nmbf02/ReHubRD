/**
 * ReHub brand mark — a single bold "R" monogram. Simple, solid, and scalable
 * (Uber/Apple sensibility): one confident form. Rendered in the brand font
 * with currentColor so it inherits its chip's color (white on the teal tile).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="ReHub">
      <text
        x="16"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif"
        fontWeight={800}
        fontSize={25}
        letterSpacing={-1.2}
        fill="currentColor"
      >
        R
      </text>
    </svg>
  );
}
