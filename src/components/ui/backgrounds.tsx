"use client";

/**
 * Ambient background layers — the "atmosphere" behind ReHub sections.
 * Purely decorative and pointer-events-none, so they never block UI.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft animated aurora blobs. Drop into a `relative overflow-hidden` parent. */
export function AuroraBackground({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "ink";
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className={cn(
          "absolute -top-1/3 left-1/4 h-[42rem] w-[42rem] rounded-full blur-3xl animate-aurora",
          variant === "ink" ? "bg-rehub-400/25" : "bg-rehub-400/30"
        )}
      />
      <div
        className={cn(
          "absolute top-1/4 -right-1/4 h-[38rem] w-[38rem] rounded-full blur-3xl animate-aurora [animation-delay:-6s]",
          variant === "ink" ? "bg-rehub-600/30" : "bg-rehub-300/30"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-1/3 left-1/3 h-[36rem] w-[36rem] rounded-full blur-3xl animate-aurora [animation-delay:-11s]",
          variant === "ink" ? "bg-rehub-500/25" : "bg-rehub-200/40"
        )}
      />
    </div>
  );
}

/** Faint grid lines that fade out radially. Great for hero / dark sections. */
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
        fade && "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]",
        className
      )}
    />
  );
}

/** A single positioned glow orb — compose a few for depth. */
export function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-3xl animate-glow-pulse", className)}
    />
  );
}

/** Conic spotlight beam, typically top-center of a dark hero. */
export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/4",
        "bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.18),transparent_60%)] blur-2xl",
        className
      )}
    />
  );
}

/** Infinite horizontal marquee. Duplicates children for a seamless loop. */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("mask-fade-x flex w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center gap-10 pr-10 animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
