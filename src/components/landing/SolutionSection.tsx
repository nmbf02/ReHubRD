"use client";

import { useTranslations } from "next-intl";
import {
  Compass,
  ClipboardList,
  RefreshCw,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Stagger, StaggerItem, TiltCard } from "@/components/ui/motion";
import { GlowOrb } from "@/components/ui/backgrounds";

const SOLUTION_KEYS = ["structured", "plan", "followup", "professional"] as const;

const SOLUTION_ICONS: Record<(typeof SOLUTION_KEYS)[number], LucideIcon> = {
  structured: Compass,
  plan: ClipboardList,
  followup: RefreshCw,
  professional: UserCheck,
};

export function SolutionSection() {
  const t = useTranslations("landing.solution");

  return (
    <section
      id="solucion"
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <GlowOrb className="-left-24 top-10 h-72 w-72 bg-rehub-200/40" />
      <GlowOrb className="-right-24 bottom-0 h-80 w-80 bg-rehub-300/30 [animation-delay:-4s]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={t("intro")}
        />

        <Stagger className="mt-16 grid gap-6 md:grid-cols-2">
          {SOLUTION_KEYS.map((key, i) => {
            const Icon = SOLUTION_ICONS[key];
            return (
              <StaggerItem key={key}>
                <TiltCard
                  max={4}
                  className="group relative h-full rounded-3xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-8 shadow-card transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated"
                >
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10"
                    aria-hidden
                  />
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-rehub-100 bg-white text-[11px] font-bold text-rehub-700 shadow-soft">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-balance text-xl font-bold tracking-tight text-rehub-950">
                        {t(`${key}.title`)}
                      </h3>
                      <p className="mt-2 text-pretty leading-relaxed text-rehub-900/65">
                        {t(`${key}.desc`)}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
