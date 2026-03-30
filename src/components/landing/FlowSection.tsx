"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const STEP_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export function FlowSection() {
  const t = useTranslations("landing.flow");

  return (
    <section id="funcionamiento" className="py-20 lg:py-28 bg-gradient-to-b from-rehub-light/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-rehub-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-rehub-dark/70">{t("intro")}</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-rehub-primary/30 -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-0">
            {STEP_NUMBERS.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col lg:flex-row gap-8 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 lg:max-w-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-rehub-primary text-white flex items-center justify-center font-bold">
                      {step}
                    </span>
                    <h3 className="font-semibold text-xl text-rehub-dark">
                      {t(`step${step}.title`)}
                    </h3>
                  </div>
                  <p className="text-rehub-dark/70 pl-14">{t(`step${step}.desc`)}</p>
                </div>
                <div className="hidden lg:flex flex-shrink-0 w-16" />
                <div className="hidden lg:flex flex-shrink-0 w-16" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
