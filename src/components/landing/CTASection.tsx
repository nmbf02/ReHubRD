"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { GridBackground } from "@/components/ui/backgrounds";
import { Reveal } from "@/components/ui/motion";

export function CTASection() {
  const t = useTranslations("landing.cta");

  return (
    <section id="contacto" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-ink-gradient relative overflow-hidden rounded-2xl px-6 py-16 shadow-elevated sm:px-12 lg:px-16 lg:py-20">
            <GridBackground variant="ink" />

            <div className="relative mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rehub-300">
                {t("registerSoon")}
              </span>

              <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
                {t("title")}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-rehub-100/80">
                {t("body")}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="mailto:contacto@rehub.do"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-rehub-800 shadow-soft transition-colors hover:bg-rehub-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rehub-900"
                >
                  <Mail className="h-4 w-4" />
                  {t("contact")}
                </a>
                <Link
                  href={ROUTES.register}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {t("registerSoon")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="mt-8 inline-flex items-center justify-center gap-2 text-sm text-rehub-100/65">
                <ShieldCheck className="h-4 w-4 text-rehub-300" />
                {t("disclaimer")}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
