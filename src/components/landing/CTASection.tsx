"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AuroraBackground, GridBackground, GlowOrb } from "@/components/ui/backgrounds";
import { Reveal, Magnetic } from "@/components/ui/motion";

export function CTASection() {
  const t = useTranslations("landing.cta");

  return (
    <section id="contacto" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-ink-gradient grain relative overflow-hidden rounded-3xl px-6 py-16 shadow-elevated sm:px-12 lg:px-16 lg:py-20">
            <AuroraBackground variant="ink" />
            <GridBackground variant="ink" />
            <GlowOrb className="-right-16 -top-16 h-64 w-64 bg-rehub-400/30" />
            <GlowOrb className="-bottom-20 -left-12 h-56 w-56 bg-rehub-500/25 [animation-delay:-4s]" />

            <div className="relative mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-rehub-100 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                ReHub
              </span>

              <h2 className="mt-6 text-balance text-3xl font-bold leading-[1.1] tracking-tightest text-white sm:text-4xl lg:text-[2.75rem]">
                {t("title")}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-rehub-100/80">
                {t("body")}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic>
                  <a
                    href="mailto:contacto@rehub.do"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-rehub-700 shadow-glow transition-all hover:bg-rehub-50 hover:shadow-glow-lg"
                  >
                    <Mail className="h-4 w-4" />
                    {t("contact")}
                  </a>
                </Magnetic>
                <Magnetic>
                  <Link
                    href={ROUTES.register}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/10"
                  >
                    {t("registerSoon")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>

              <p className="mt-8 inline-flex items-center justify-center gap-2 text-sm text-rehub-100/70">
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
