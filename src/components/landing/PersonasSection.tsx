"use client";

import { useTranslations } from "next-intl";
import { HeartPulse, HeartHandshake, Stethoscope, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const PERSONAS: { key: string; Icon: LucideIcon }[] = [
  { key: "patient", Icon: HeartPulse },
  { key: "caregiver", Icon: HeartHandshake },
  { key: "professional", Icon: Stethoscope },
];

export function PersonasSection() {
  const t = useTranslations("landing.personas");

  return (
    <section className="bg-rehub-50/40 py-20 dark:bg-rehub-900/30 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {PERSONAS.map(({ key, Icon }) => (
            <StaggerItem key={key}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-white p-7 shadow-soft transition-colors hover:border-rehub-300 dark:border-white/10 dark:bg-rehub-950/60 dark:hover:border-rehub-500/50">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-rehub-700 text-white">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-rehub-950 dark:text-white">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-rehub-900/65 dark:text-rehub-100/65">
                  {t(`${key}.desc`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
