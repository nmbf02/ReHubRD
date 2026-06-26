"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section";
import { EmotionPanel } from "@/components/landing/EmotionPanel";

const IMG = "https://images.unsplash.com/photo-";
const Q = "?auto=format&fit=crop&w=1400&q=72";

// Real human emotion, one per problem the platform addresses.
const PROBLEMS = [
  { key: "postDischarge", img: `${IMG}1473830394358-91588751b241${Q}` }, // alone, facing the sea
  { key: "misinformation", img: `${IMG}1586473219010-2ffc57b0d282${Q}` }, // buried in sticky notes
  { key: "treatmentDropout", img: `${IMG}1554188572-9d184b57d8e2${Q}` }, // exhausted, hand on face
  { key: "emotionalIsolation", img: `${IMG}1647942678809-bc501a2c2b6a${Q}` }, // withdrawn, slumped
];

export function ProblemSection() {
  const t = useTranslations("landing.problem");
  const emotions = t.raw("emotions") as string[];
  const [active, setActive] = useState(0);

  return (
    <section id="problema" className="relative overflow-hidden bg-ink-gradient py-20 lg:py-28">
      {/* the felt emotion, looming faintly behind — changes as each panel arrives */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="select-none whitespace-nowrap text-[26vw] font-black uppercase leading-none tracking-tighter text-white/[0.045]"
            >
              {emotions[active]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tone="light"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={t("intro")}
          className="mb-16 lg:mb-24"
        />
        <div className="space-y-20 lg:space-y-28">
          {PROBLEMS.map((p, i) => (
            <EmotionPanel
              key={p.key}
              image={p.img}
              alt={t(`${p.key}.title`)}
              index={`0${i + 1}`}
              title={t(`${p.key}.title`)}
              desc={t(`${p.key}.desc`)}
              reversed={i % 2 === 1}
              tone="dark"
              onActive={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
