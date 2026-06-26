"use client";

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

  return (
    <section id="problema" className="relative overflow-hidden bg-ink-gradient py-20 lg:py-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
