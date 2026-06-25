"use client";

import { useTranslations } from "next-intl";
import { Hospital, HelpCircle, TrendingDown, CloudRain } from "lucide-react";
import { AuroraBackground, GridBackground } from "@/components/ui/backgrounds";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section";

const PROBLEM_ITEMS = [
  { key: "postDischarge" as const, Icon: Hospital },
  { key: "misinformation" as const, Icon: HelpCircle },
  { key: "treatmentDropout" as const, Icon: TrendingDown },
  { key: "emotionalIsolation" as const, Icon: CloudRain },
];

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section
      id="problema"
      className="relative overflow-hidden bg-ink-gradient grain py-20 text-white lg:py-28"
    >
      <GridBackground variant="ink" className="-z-0" />
      <AuroraBackground variant="ink" className="-z-0 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tone="light"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={t("intro")}
          className="mb-16"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_ITEMS.map(({ key, Icon }) => (
            <StaggerItem
              key={key}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-rehub-200 transition-colors group-hover:bg-white/15">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-rehub-100/75">
                {t(`${key}.desc`)}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
