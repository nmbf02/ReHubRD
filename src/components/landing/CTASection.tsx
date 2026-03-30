"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/routes";

export function CTASection() {
  const t = useTranslations("landing.cta");

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-rehub-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">{t("body")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contacto@rehub.do"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-rehub-primary rounded-xl font-semibold hover:bg-rehub-light transition-colors"
            >
              {t("contact")}
            </a>
            <Link
              href={ROUTES.register}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              {t("registerSoon")}
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/80">{t("disclaimer")}</p>
        </motion.div>
      </div>
    </section>
  );
}
