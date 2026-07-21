"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircleHeart, ArrowRight, Phone, Sparkles, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  INTAKE_QUESTIONS,
  suggestionsFor,
  type IntakeAnswers,
  type IntakeId,
  type SuggestionTone,
} from "@/lib/intake";
import { getIntake, saveIntake, INTAKE_UPDATED_EVENT } from "@/lib/intake-store";

interface Props {
  userId: string | null;
}

const TONE_STYLES: Record<SuggestionTone, { card: string; chip: string; chipText: string }> = {
  urgent: { card: "border-red-200 bg-red-50/70", chip: "bg-red-100", chipText: "text-red-700" },
  free: { card: "border-rehub-200 bg-rehub-50/70", chip: "bg-rehub-100", chipText: "text-rehub-700" },
  soon: { card: "border-amber-200 bg-amber-50/60", chip: "bg-amber-100", chipText: "text-amber-700" },
  normal: { card: "border-rehub-100 bg-white", chip: "bg-rehub-100", chipText: "text-rehub-700" },
};

export function IntakeView({ userId }: Props) {
  const t = useTranslations("dashboard.intake");
  const [answers, setAnswers] = useState<IntakeAnswers>({});

  useEffect(() => {
    const refresh = () => setAnswers(getIntake(userId));
    refresh();
    window.addEventListener(INTAKE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(INTAKE_UPDATED_EVENT, refresh);
  }, [userId]);

  const choose = useCallback(
    (id: IntakeId, value: string) => {
      const next = { ...answers, [id]: value };
      setAnswers(next);
      saveIntake(next, userId);
    },
    [answers, userId]
  );

  const suggestions = useMemo(() => suggestionsFor(answers), [answers]);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Questions */}
      <div className="space-y-4">
        {INTAKE_QUESTIONS.map((question) => (
          <Reveal key={question.id}>
            <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
              <p className="mb-3 text-sm font-semibold text-rehub-950">{t(`questions.${question.id}.q`)}</p>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const active = answers[question.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(question.id, option)}
                      className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-rehub-500 bg-rehub-600 text-white shadow-glow"
                          : "border-rehub-200 bg-white text-rehub-800 hover:bg-rehub-50"
                      }`}
                    >
                      {t(`questions.${question.id}.${option}`)}
                    </button>
                  );
                })}
              </div>
            </section>
          </Reveal>
        ))}
      </div>

      {/* Live suggestions */}
      <Reveal>
        <section className="sticky top-6 rounded-2xl border border-rehub-100 bg-gradient-to-br from-rehub-50 to-white p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <MessageCircleHeart className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-rehub-950">{t("suggestionsTitle")}</h3>
          </div>
          <p className="mb-4 text-xs text-rehub-900/55">{t("description")}</p>

          {answeredCount === 0 ? (
            <p className="rounded-xl border border-dashed border-rehub-200 bg-white/60 px-4 py-8 text-center text-sm text-rehub-900/55">
              {t("suggestionsEmpty")}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {suggestions.map((s) => {
                const styles = TONE_STYLES[s.tone];
                return (
                  <li key={s.id} className={`rounded-xl border p-3.5 ${styles.card}`}>
                    <div className="flex items-start gap-2">
                      {s.tone === "soon" && <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                      {s.tone === "free" && <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rehub-600" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-rehub-950">{t(`sug.${s.id}.t`)}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-rehub-900/60">{t(`sug.${s.id}.d`)}</p>
                        {s.href && (
                          <Link
                            href={s.href}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 hover:text-rehub-700"
                          >
                            {t("go")}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                        {s.tel && (
                          <a
                            href={`tel:${s.tel}`}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rehub-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rehub-700"
                          >
                            <Phone className="h-3 w-3" />
                            {t("call")} {s.tel}
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Reveal>
    </div>
  );
}
