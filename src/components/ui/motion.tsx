"use client";

/**
 * Shared motion primitives for ReHub — deliberately restrained.
 *
 * The house style favors a single, quiet reveal-on-scroll and real hover
 * states over decorative effects. `Magnetic`, `TiltCard`, and the count-up
 * `NumberTicker` were intentionally reduced to no-op / static so the product
 * reads as a calm, trustworthy tool rather than an animated showcase. They
 * remain as thin wrappers for API compatibility with existing call sites.
 */

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsetFor = (dir: Direction, distance: number) => {
  switch (dir) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
};

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  once?: boolean;
}

/** A single, quiet fade + small rise as a block scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 14,
  once = true,
  className,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  once?: boolean;
}

/** Wrap a list/grid; direct <StaggerItem> children rise in sequence. */
export function Stagger({ children, once = true, className, ...rest }: StaggerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: Omit<HTMLMotionProps<"div">, "ref"> & { children: ReactNode }) {
  return (
    <motion.div variants={staggerItem} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Static, locale-formatted number. (Count-up animation intentionally removed.) */
export function NumberTicker({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {value.toLocaleString("es-DO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Passthrough wrapper (magnetic cursor effect intentionally removed). */
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  return <span className={cn("inline-flex", className)}>{children}</span>;
}

/** Passthrough card wrapper (3D tilt intentionally removed). */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  return <div className={className}>{children}</div>;
}
