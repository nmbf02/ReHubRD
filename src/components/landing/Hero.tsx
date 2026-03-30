"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/routes";

export function Hero() {
  const t = useTranslations("landing.hero");

  const cards = [
    { icon: "🩺", titleKey: "cards.profile.title", descKey: "cards.profile.desc" },
    { icon: "📋", titleKey: "cards.plan.title", descKey: "cards.plan.desc" },
    { icon: "🔄", titleKey: "cards.followup.title", descKey: "cards.followup.desc" },
  ] as const;

  return (
    <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rehub-light/30 via-white to-rehub-accent/5" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-rehub-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rehub-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rehub-primary/10 text-rehub-primary text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-rehub-primary animate-pulse" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rehub-dark leading-tight"
            >
              {t("titlePrefix")}{" "}
              <span className="text-rehub-primary">{t("titleHighlight")}</span>{" "}
              {t("titleSuffix")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-rehub-dark/80 max-w-xl"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href={ROUTES.login}
                className="inline-flex items-center justify-center px-8 py-4 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-all shadow-lg shadow-rehub-primary/25 hover:shadow-rehub-primary/40"
              >
                {t("ctaPrimary")}
              </Link>
              <a
                href="#funcionamiento"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-rehub-primary text-rehub-primary rounded-xl font-semibold hover:bg-rehub-primary/5 transition-all"
              >
                {t("ctaSecondary")}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto lg:max-w-none rounded-2xl bg-gradient-to-br from-rehub-primary/20 to-rehub-accent/20 p-8 flex flex-col justify-center">
              <div className="space-y-6">
                {cards.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-white/80 rounded-xl backdrop-blur"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-rehub-dark">{t(item.titleKey)}</p>
                      <p className="text-sm text-rehub-dark/70">{t(item.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
