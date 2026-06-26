"use client";

/**
 * Background layers. The decorative aurora/glow/spotlight effects were retired
 * (they read as "AI showcase"); these now return null so existing call sites
 * stay valid but render nothing. A faint static grid remains as the one
 * restrained texture, and the marquee is a static, non-scrolling row.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Retired — no decorative aurora. */
export function AuroraBackground(_: { className?: string; variant?: "light" | "ink" }) {
  return null;
}

/** Faint static grid. The one texture we keep — quiet and architectural. */
export function GridBackground({
  className,
  variant = "light",
  fade = true,
}: {
  className?: string;
  variant?: "light" | "ink";
  fade?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-grid",
        variant === "ink" ? "bg-grid-light" : "bg-grid-rehub",
        fade &&
          "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]",
        className
      )}
    />
  );
}

/** Retired — no glow orbs. */
export function GlowOrb(_: { className?: string }) {
  return null;
}

/** Retired — no spotlight beam. */
export function Spotlight(_: { className?: string }) {
  return null;
}

/** Static row (infinite scroll removed). Items wrap naturally. */
export function Marquee({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("flex w-full flex-wrap items-center justify-center gap-3", className)}>
      {children}
    </div>
  );
}
