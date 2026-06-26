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
        "text-xs font-semibold uppercase tracking-[0.16em]",
        tone === "brand" ? "text-rehub-700 dark:text-rehub-300" : "text-rehub-300",
        className
      )}
    >
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
          tone === "light" ? "text-white" : "text-rehub-950 dark:text-white"
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 text-pretty text-lg leading-relaxed",
            tone === "light" ? "text-rehub-100/80" : "text-rehub-900/65 dark:text-rehub-100/70"
          )}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
