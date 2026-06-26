"use client";

import { useTranslations } from "next-intl";
import {
  UserPlus,
  ClipboardCheck,
  ListChecks,
  CalendarCheck,
  SlidersHorizontal,
  PartyPopper,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { GridBackground, GlowOrb } from "@/components/ui/backgrounds";
import { SectionHeading } from "@/components/ui/section";

const STEPS: { step: number; Icon: LucideIcon }[] = [
  { step: 1, Icon: UserPlus },
  { step: 2, Icon: ClipboardCheck },
  { step: 3, Icon: ListChecks },
  { step: 4, Icon: CalendarCheck },
  { step: 5, Icon: SlidersHorizontal },
  { step: 6, Icon: PartyPopper },
];

export function FlowSection() {
  const t = useTranslations("landing.flow");

  return (
    <section
      id="funcionamiento"
      className="relative overflow-hidden bg-gradient-to-b from-rehub-50/60 to-white py-20 dark:from-rehub-900/30 dark:to-rehub-950 lg:py-28"
    >
      <GridBackground className="-z-10 opacity-60" />
      <GlowOrb className="left-1/2 top-24 h-64 w-64 -translate-x-1/2 bg-rehub-300/30" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("intro")} />

        <div className="relative mt-16">
          {/* Center gradient spine (desktop) + left rail (mobile) */}
          <div
            aria-hidden
            className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-rehub-200 via-rehub-300/70 to-rehub-200/0 lg:left-1/2 lg:-translate-x-1/2"
          />

          <ol className="space-y-10 lg:space-y-0">
            {STEPS.map(({ step, Icon }, i) => {
              const isRight = i % 2 === 1;
              return (
                <Reveal
                  key={step}
                  delay={i * 0.08}
                  direction="up"
                  className="relative pl-20 lg:pl-0"
                >
                  <li
                    className={`relative flex items-stretch lg:items-center ${
                      isRight ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Glowing numbered node on the spine */}
                    <span
                      aria-hidden
                      className="absolute left-6 top-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-rehub-100 bg-brand-gradient text-base font-bold text-white shadow-glow lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2"
                    >
                      {step}
                    </span>

                    {/* Card */}
                    <div className="lg:w-1/2 lg:px-12 lg:py-6">
                      <div className="group rounded-2xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated dark:border-white/10 dark:from-rehub-900/50 dark:to-rehub-900/50 dark:hover:border-rehub-500/50">
                        <div className="flex items-start gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 transition-colors group-hover:bg-rehub-600 group-hover:text-white dark:bg-white/10 dark:text-rehub-300">
                            <Icon className="h-6 w-6" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-rehub-600">
                                {step}/{STEPS.length}
                              </span>
                              {step === STEPS.length ? (
                                <CheckCircle2
                                  className="h-4 w-4 text-rehub-500"
                                  aria-hidden
                                />
                              ) : null}
                            </div>
                            <h3 className="mt-1 text-balance text-xl font-bold leading-snug tracking-tight text-rehub-950 dark:text-white">
                              {t(`step${step}.title`)}
                            </h3>
                            <p className="mt-2 text-pretty leading-relaxed text-rehub-900/70 dark:text-rehub-100/70">
                              {t(`step${step}.desc`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spacer for the opposite column on desktop */}
                    <div className="hidden lg:block lg:w-1/2" />
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
