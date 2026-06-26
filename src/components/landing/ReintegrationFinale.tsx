"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/motion";

/**
 * The emotional finale: a full-bleed video of a family embracing — the
 * destination of the whole journey, reintegration. The clip is lazy
 * (preload="none") and only plays while on screen; reduced-motion users get
 * the poster with manual controls.
 */
export function ReintegrationFinale() {
  const t = useTranslations("landing.finale");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const video = videoRef.current;
    if (!video || mq.matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden bg-rehub-950">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/video/reintegration-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        controls={reduced}
        aria-hidden={!reduced}
      >
        <source src="/video/reintegration.mp4" type="video/mp4" />
      </video>

      {/* legibility + brand tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-rehub-950 via-rehub-950/55 to-rehub-950/45" />
      <div className="absolute inset-0 bg-rehub-950/20 mix-blend-multiply" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rehub-300">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-rehub-50/90">
            {t("body")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
