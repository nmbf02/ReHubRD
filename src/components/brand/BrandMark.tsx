import { cn } from "@/lib/utils";

/**
 * ReHub brand mark — the official logo (mint "R" with a face in the counter).
 * Shown on its own (transparent PNG); reads well on both light and dark.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/rehub-logo.png"
      alt="ReHub"
      draggable={false}
      className={cn("object-contain", className)}
    />
  );
}
