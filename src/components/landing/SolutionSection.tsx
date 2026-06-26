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
import { Stagger, StaggerItem } from "@/components/ui/motion";

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
    <section id="solucion" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("intro")} />

        <Stagger className="mt-14 grid gap-5 md:grid-cols-2">
          {SOLUTION_KEYS.map((key, i) => {
            const Icon = SOLUTION_ICONS[key];
            return (
              <StaggerItem key={key}>
                <div className="group flex h-full gap-5 rounded-xl border border-border bg-white p-6 shadow-soft transition-colors hover:border-rehub-300">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rehub-700 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-rehub-900/40">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-rehub-950">
                      {t(`${key}.title`)}
                    </h3>
                    <p className="mt-1.5 text-pretty leading-relaxed text-rehub-900/65">
                      {t(`${key}.desc`)}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
