"use client";

/**
 * Section scaffolding — consistent eyebrow + heading + lede across every
 * marketing section so the rhythm and type scale never drift.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/motion";

/** Small pill label above a section title. */
export function Eyebrow({
  children,
  className,
  tone = "brand",
}: {
  children: ReactNode;
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider",
        tone === "brand"
          ? "border-rehub-200 bg-rehub-50 text-rehub-700"
          : "border-white/15 bg-white/10 text-rehub-100 backdrop-blur",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  tone = "brand",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "center" | "left";
  tone?: "brand" | "light";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <div className={cn("mb-5", align === "center" && "flex justify-center")}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2
        className={cn(
          "text-balance text-3xl font-bold leading-[1.1] tracking-tightest sm:text-4xl lg:text-[2.75rem]",
          tone === "light" ? "text-white" : "text-rehub-950"
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 text-pretty text-lg leading-relaxed",
            tone === "light" ? "text-rehub-100/80" : "text-rehub-900/65"
          )}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
