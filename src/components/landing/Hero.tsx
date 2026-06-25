"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Stethoscope,
  ClipboardList,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AuroraBackground, GridBackground, GlowOrb } from "@/components/ui/backgrounds";
import { Magnetic, TiltCard, NumberTicker } from "@/components/ui/motion";

const PREVIEW_CARDS = [
  { key: "profile", Icon: Stethoscope, done: true },
  { key: "plan", Icon: ClipboardList, done: true },
  { key: "followup", Icon: RefreshCw, done: false },
] as const;

const STATS = [
  { value: 24, suffix: "", key: "statGuides" },
  { value: 35, suffix: "", key: "statCenters" },
  { value: 31, suffix: "", key: "statProvinces" },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rehub-50/80 via-white to-white" />
      <AuroraBackground className="-z-10 opacity-70" />
      <GridBackground className="-z-10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-rehub-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-rehub-700 shadow-soft backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rehub-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rehub-500" />
              </span>
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
              className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tightest text-rehub-950 sm:text-5xl lg:text-6xl"
            >
              {t("titlePrefix")}{" "}
              <span className="relative whitespace-nowrap">
                <span className="text-gradient-brand">{t("titleHighlight")}</span>
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-rehub-300"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 9C40 4 120 3 198 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              {t("titleSuffix")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-rehub-900/70"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic>
                <Link
                  href={ROUTES.login}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-7 py-3.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
                >
                  {t("ctaPrimary")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <a
                href="#funcionamiento"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rehub-200 bg-white/70 px-7 py-3.5 font-semibold text-rehub-800 backdrop-blur transition-all hover:border-rehub-300 hover:bg-rehub-50"
              >
                <Sparkles className="h-4 w-4 text-rehub-500" />
                {t("ctaSecondary")}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-rehub-700/80">
                <ShieldCheck className="h-4 w-4 text-rehub-600" />
                {t("trustLabel")}
              </div>
              <dl className="mt-5 grid max-w-md grid-cols-3 gap-4">
                {STATS.map((s) => (
                  <div key={s.key} className="border-l-2 border-rehub-200 pl-3">
                    <dt className="text-2xl font-bold tracking-tight text-rehub-950 sm:text-3xl">
                      <NumberTicker value={s.value} suffix={s.suffix} />
                    </dt>
                    <dd className="mt-0.5 text-xs leading-tight text-rehub-900/55">
                      {t(s.key)}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>

          {/* App preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="relative"
          >
            <GlowOrb className="-right-10 -top-10 h-48 w-48 bg-rehub-300/50" />
            <GlowOrb className="-bottom-12 -left-8 h-44 w-44 bg-rehub-400/40 [animation-delay:-3s]" />

            <TiltCard className="relative" max={5}>
              <div className="rounded-3xl border border-rehub-100 bg-white/80 p-2 shadow-elevated backdrop-blur-xl">
                <div className="rounded-[1.35rem] border border-rehub-100/80 bg-gradient-to-br from-white to-rehub-50/60 p-6">
                  {/* card header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                        <ClipboardList className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-rehub-950">
                          {t("previewTitle")}
                        </p>
                        <p className="text-[11px] text-rehub-900/50">
                          {t("previewProgress")}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rehub-100 px-2.5 py-1 text-[11px] font-semibold text-rehub-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rehub-500" />
                      {t("previewBadge")}
                    </span>
                  </div>

                  {/* progress ring + label */}
                  <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
                    <ProgressRing value={62} />
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-rehub-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "62%" }}
                          transition={{ duration: 1.1, delay: 0.6, ease }}
                          className="h-full rounded-full bg-brand-gradient"
                        />
                      </div>
                      <div className="mt-2.5 flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={
                              i < 2
                                ? "h-1.5 flex-1 rounded-full bg-rehub-500"
                                : "h-1.5 flex-1 rounded-full bg-rehub-100"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* steps */}
                  <div className="mt-4 space-y-2.5">
                    {PREVIEW_CARDS.map(({ key, Icon, done }, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease }}
                        className="flex items-center gap-3 rounded-xl border border-rehub-100/80 bg-white p-3"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            done
                              ? "bg-rehub-100 text-rehub-700"
                              : "bg-rehub-50 text-rehub-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-rehub-950">
                            {t(`cards.${key}.title`)}
                          </p>
                          <p className="truncate text-xs text-rehub-900/55">
                            {t(`cards.${key}.desc`)}
                          </p>
                        </div>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            done
                              ? "bg-rehub-500 text-white"
                              : "border border-rehub-200 text-rehub-300"
                          }`}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#CCFBF1" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#0D9488"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (value / 100) * c }}
          transition={{ duration: 1.2, delay: 0.6, ease }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-rehub-800">
        {value}%
      </span>
    </div>
  );
}
