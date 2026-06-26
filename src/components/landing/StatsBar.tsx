"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/motion";

export function StatsBar() {
  const t = useTranslations("landing.statsbar");
  const resources = t.raw("resources") as string[];

  return (
    <section className="border-b border-border bg-rehub-50/40 dark:bg-rehub-900/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-rehub-900/45 dark:text-rehub-100/45">
            {t("label")}
          </p>
          <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {resources.map((name) => (
              <li
                key={name}
                className="text-sm font-medium text-rehub-900/65 dark:text-rehub-100/65"
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
