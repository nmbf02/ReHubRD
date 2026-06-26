"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

export function FAQSection() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as FaqItem[];
  const [open, setOpen] = useState(0);

  return (
    <section className="relative overflow-hidden bg-rehub-50/60 py-20 dark:bg-rehub-900/30 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <Reveal className="mt-12 space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-rehub-950/60",
                  isOpen
                    ? "border-rehub-200 shadow-card dark:border-rehub-500/40"
                    : "border-rehub-100 dark:border-white/10"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-rehub-950 dark:text-white">{item.q}</span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                      isOpen
                        ? "rotate-45 bg-rehub-600 text-white"
                        : "bg-rehub-100 text-rehub-700 dark:bg-white/10 dark:text-rehub-300"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-6 pb-5 text-pretty leading-relaxed text-rehub-900/65 dark:text-rehub-100/65">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
