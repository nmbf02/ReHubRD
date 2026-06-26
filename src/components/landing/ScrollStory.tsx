"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Stethoscope,
  ClipboardList,
  RefreshCw,
  BookOpen,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

interface ModuleConfig {
  key: string;
  Icon: LucideIcon;
  fromX: number;
  fromY: number;
  fromRot: number;
  fromZ: number;
  delay: number;
}

// Each plan module flies in from a different point in 3D space and locks into a
// 2×2 grid — the recovery plan "assembling" as you scroll.
const MODULES: ModuleConfig[] = [
  { key: "profile", Icon: Stethoscope, fromX: -380, fromY: -200, fromRot: -20, fromZ: -380, delay: 0 },
  { key: "plan", Icon: ClipboardList, fromX: 380, fromY: -190, fromRot: 18, fromZ: -300, delay: 0.05 },
  { key: "followup", Icon: RefreshCw, fromX: -340, fromY: 230, fromRot: 16, fromZ: -420, delay: 0.1 },
  { key: "resources", Icon: BookOpen, fromX: 360, fromY: 220, fromRot: -18, fromZ: -340, delay: 0.15 },
];

function StoryModule({
  progress,
  config,
  title,
  desc,
}: {
  progress: MotionValue<number>;
  config: ModuleConfig;
  title: string;
  desc: string;
}) {
  const a = 0.08 + config.delay;
  const b = 0.58 + config.delay;
  const x = useTransform(progress, [a, b], [config.fromX, 0]);
  const y = useTransform(progress, [a, b], [config.fromY, 0]);
  const z = useTransform(progress, [a, b], [config.fromZ, 0]);
  const rotate = useTransform(progress, [a, b], [config.fromRot, 0]);
  const opacity = useTransform(progress, [a, a + 0.12], [0, 1]);

  return (
    <motion.div
      style={{ x, y, z, rotate, opacity }}
      className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md shadow-elevated"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rehub-500/90 text-white">
          <config.Icon className="h-5 w-5" />
        </span>
        <p className="font-semibold text-white">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-rehub-100/70">{desc}</p>
      <div className="mt-4 space-y-2">
        <span className="block h-1.5 w-full rounded-full bg-white/10" />
        <span className="block h-1.5 w-4/5 rounded-full bg-white/10" />
        <span className="block h-1.5 w-2/3 rounded-full bg-rehub-400/40" />
      </div>
    </motion.div>
  );
}

function Headline({
  progress,
  range,
  eyebrow,
  title,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  eyebrow: string;
  title: string;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[1]], [24, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 top-[14%] z-20 mx-auto max-w-2xl px-6 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rehub-300">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </motion.div>
  );
}

function StaticStory({ t }: { t: ReturnType<typeof useTranslations> }) {
  // Reduced-motion / no-scroll fallback: show the assembled plan plainly.
  return (
    <section className="bg-ink-gradient py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rehub-300">{t("eyebrow")}</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("h3")}
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.key} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rehub-500/90 text-white">
                  <m.Icon className="h-5 w-5" />
                </span>
                <p className="font-semibold text-white">{t(`modules.${m.key}.title`)}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-rehub-100/70">{t(`modules.${m.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScrollStory() {
  const t = useTranslations("landing.story");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // depth + scene transforms (hooks must run unconditionally)
  const glowY = useTransform(scrollYProgress, [0, 1], ["-12%", "18%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.35, 1.1]);
  const sceneRotateX = useTransform(scrollYProgress, [0, 0.6], [20, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.6, 1], [0.82, 1, 1.04]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  if (reduce) return <StaticStory t={t} />;

  return (
    <section ref={ref} className="relative h-[340vh] bg-ink-gradient">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* parallax depth glow */}
        <motion.div
          aria-hidden
          style={{ y: glowY, scale: glowScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.22),transparent_62%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid bg-grid-light [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"
        />

        {/* narrative headlines, crossfading through the scroll */}
        <Headline progress={scrollYProgress} range={[0, 0.04, 0.18, 0.3]} eyebrow={t("eyebrow")} title={t("h1")} />
        <Headline progress={scrollYProgress} range={[0.3, 0.4, 0.5, 0.62]} eyebrow={t("eyebrow")} title={t("h2")} />
        <Headline progress={scrollYProgress} range={[0.66, 0.78, 0.95, 1]} eyebrow={t("eyebrow")} title={t("h3")} />

        {/* assembling plan — 2×2 grid in a 3D scene */}
        <div className="absolute inset-x-0 bottom-[8%] top-[40%] flex items-start justify-center px-6">
          <div style={{ perspective: 1300 }} className="w-full max-w-3xl">
            <motion.div
              style={{ rotateX: sceneRotateX, scale: sceneScale, transformStyle: "preserve-3d" }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
            >
              {MODULES.map((m) => (
                <StoryModule
                  key={m.key}
                  progress={scrollYProgress}
                  config={m}
                  title={t(`modules.${m.key}.title`)}
                  desc={t(`modules.${m.key}.desc`)}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-rehub-100/60"
        >
          <span className="text-xs font-medium uppercase tracking-[0.16em]">{t("scrollHint")}</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
