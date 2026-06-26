"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface EmotionPanelProps {
  image: string;
  alt: string;
  index: string; // "01"
  title: string;
  desc: string;
  reversed?: boolean;
  tone?: "dark" | "light";
}

/**
 * A full-width, image-led panel with scroll parallax + a slow ken-burns drift.
 * The photograph of a real person carries the emotion; the copy names it.
 * Hover lifts the tint so the image warms to full colour.
 */
export function EmotionPanel({
  image,
  alt,
  index,
  title,
  desc,
  reversed = false,
  tone = "dark",
}: EmotionPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.12, 1.05, 1.12]);

  const dark = tone === "dark";

  return (
    <div ref={ref} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated sm:aspect-[3/2] lg:aspect-[4/5]",
          reversed && "lg:order-2"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={image}
          alt={alt}
          loading="lazy"
          style={{ y, scale }}
          className="absolute inset-x-0 top-[-15%] h-[130%] w-full object-cover"
        />
        {/* legibility + brand duotone; lifts on hover */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700 group-hover:opacity-30",
            dark
              ? "bg-gradient-to-t from-rehub-950 via-rehub-950/35 to-rehub-900/10"
              : "bg-gradient-to-t from-rehub-950/45 via-rehub-950/5 to-transparent"
          )}
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        <span
          className={cn(
            "absolute left-5 top-4 font-mono text-sm font-semibold tracking-widest",
            dark ? "text-white/70" : "text-white/85"
          )}
        >
          {index}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn("max-w-lg", reversed && "lg:order-1")}
      >
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            dark ? "text-rehub-300" : "text-rehub-700 dark:text-rehub-300"
          )}
        >
          {index}
        </span>
        <h3
          className={cn(
            "mt-3 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl",
            dark ? "text-white" : "text-rehub-950 dark:text-white"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-4 text-pretty text-lg leading-relaxed",
            dark ? "text-rehub-100/75" : "text-rehub-900/70 dark:text-rehub-100/75"
          )}
        >
          {desc}
        </p>
      </motion.div>
    </div>
  );
}
