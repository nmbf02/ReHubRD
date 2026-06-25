"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Building2, MapPin, PhoneCall } from "lucide-react";
import { Marquee } from "@/components/ui/backgrounds";
import { Reveal, NumberTicker } from "@/components/ui/motion";

const STATS = [
  { value: 24, Icon: BookOpen, key: "guidesLabel" as const },
  { value: 35, Icon: Building2, key: "centersLabel" as const },
  { value: 31, Icon: MapPin, key: "provincesLabel" as const },
  { value: 2, Icon: PhoneCall, key: "linesLabel" as const },
];

export function StatsBar() {
  const t = useTranslations("landing.statsbar");
  const resources = t.raw("resources") as string[];

  return (
    <section className="relative border-y border-rehub-100 bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, Icon, key }) => (
            <div
              key={key}
              className="group flex items-center gap-4 rounded-2xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 transition-colors group-hover:bg-rehub-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-3xl font-bold tracking-tight text-rehub-950">
                  <NumberTicker value={value} />
                </p>
                <p className="text-sm leading-tight text-rehub-900/60">{t(key)}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="mt-10">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-rehub-700/60">
            {t("label")}
          </p>
          <Marquee>
            {resources.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-rehub-100 bg-white px-5 py-2 text-sm font-medium text-rehub-800 shadow-soft"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rehub-400" />
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
