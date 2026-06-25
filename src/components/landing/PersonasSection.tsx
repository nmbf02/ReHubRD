"use client";

import { useTranslations } from "next-intl";
import { HeartPulse, HeartHandshake, Stethoscope, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Stagger, StaggerItem, TiltCard } from "@/components/ui/motion";

const PERSONAS: { key: string; Icon: LucideIcon }[] = [
  { key: "patient", Icon: HeartPulse },
  { key: "caregiver", Icon: HeartHandshake },
  { key: "professional", Icon: Stethoscope },
];

export function PersonasSection() {
  const t = useTranslations("landing.personas");

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={t("lede")}
        />

        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {PERSONAS.map(({ key, Icon }) => (
            <StaggerItem key={key}>
              <TiltCard className="h-full" max={4}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/40 p-7 shadow-card transition-all hover:border-rehub-200 hover:shadow-elevated">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rehub-100/60 blur-2xl transition-opacity group-hover:opacity-100" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <h3 className="relative mt-6 text-xl font-bold tracking-tight text-rehub-950">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="relative mt-3 text-pretty leading-relaxed text-rehub-900/65">
                    {t(`${key}.desc`)}
                  </p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
