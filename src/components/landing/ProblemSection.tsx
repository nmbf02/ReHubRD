"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const PROBLEM_ITEMS = [
  { key: "postDischarge" as const, icon: "🏥" },
  { key: "misinformation" as const, icon: "❓" },
  { key: "treatmentDropout" as const, icon: "📉" },
  { key: "emotionalIsolation" as const, icon: "💭" },
];

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section id="problema" className="py-20 lg:py-28 bg-rehub-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-lg text-rehub-light/80">{t("intro")}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEM_ITEMS.map((problem, i) => (
            <motion.div
              key={problem.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="text-3xl mb-4 block">{problem.icon}</span>
              <h3 className="font-semibold text-lg mb-2">
                {t(`${problem.key}.title`)}
              </h3>
              <p className="text-rehub-light/80 text-sm">
                {t(`${problem.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
