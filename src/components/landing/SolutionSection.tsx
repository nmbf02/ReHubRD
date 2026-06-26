"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section";
import { EmotionPanel } from "@/components/landing/EmotionPanel";

const IMG = "https://images.unsplash.com/photo-";
const Q = "?auto=format&fit=crop&w=1400&q=72";

// The hopeful answer — real people supported, recovering, reconnecting.
const SOLUTIONS = [
  { key: "structured", img: `${IMG}1762955911431-4c44c7c3f408${Q}` }, // a professional guiding
  { key: "plan", img: `${IMG}1649751361457-01d3a696c7e6${Q}` }, // physiotherapy in action
  { key: "followup", img: `${IMG}1658314755707-1fbdf7c40145${Q}` }, // companionship, holding hands
  { key: "professional", img: `${IMG}1526225294770-079fcbe68745${Q}` }, // comforted on a bench
];

export function SolutionSection() {
  const t = useTranslations("landing.solution");

  return (
    <section id="solucion" className="bg-white py-20 dark:bg-rehub-950 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lede={t("intro")}
          className="mb-16 lg:mb-24"
        />
        <div className="space-y-20 lg:space-y-28">
          {SOLUTIONS.map((s, i) => (
            <EmotionPanel
              key={s.key}
              image={s.img}
              alt={t(`${s.key}.title`)}
              index={`0${i + 1}`}
              title={t(`${s.key}.title`)}
              desc={t(`${s.key}.desc`)}
              reversed={i % 2 === 1}
              tone="light"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
