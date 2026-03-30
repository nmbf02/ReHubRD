"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const SOLUTION_KEYS = ["structured", "plan", "followup", "professional"] as const;

export function SolutionSection() {
  const t = useTranslations("landing.solution");

  return (
    <section id="solucion" className="py-20 lg:py-28 bg-white">
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

        <div className="grid md:grid-cols-2 gap-8">
          {SOLUTION_KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 p-8 rounded-2xl bg-rehub-light/30 border border-rehub-primary/10 hover:border-rehub-primary/20 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rehub-primary/20 flex items-center justify-center text-rehub-primary font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-xl text-rehub-dark mb-2">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-rehub-dark/70">{t(`${key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
