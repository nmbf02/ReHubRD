"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  OPCIONES_NECESIDADES,
  getNecesidadesSeleccionadas,
  saveNecesidadesSeleccionadas,
} from "@/lib/needs-options";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";
import { CheckCircle2 } from "lucide-react";

interface Props {
  userId?: string | null;
}

export function NeedsSelector({ userId }: Props) {
  const t = useTranslations("dashboard.needs");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const mounted = useIsClientMounted();

  useEffect(() => {
    if (!mounted) return;
    setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
  }, [mounted, userId]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () =>
      setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
    window.addEventListener("rehub-necesidades-updated", handler);
    return () => window.removeEventListener("rehub-necesidades-updated", handler);
  }, [mounted, userId]);

  function toggle(id: string) {
    const next = seleccionados.includes(id)
      ? seleccionados.filter((x) => x !== id)
      : [...seleccionados, id];
    setSeleccionados(next);
    saveNecesidadesSeleccionadas(next, userId ?? undefined);
  }

  if (!mounted) return null;

  return (
    <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <Reveal direction="up" duration={0.5}>
        <div className="px-6 lg:px-8 py-5 border-b border-rehub-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-rehub-950">
              {t("selectorTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              {t("selectorHint")}
            </p>
          </div>
          {seleccionados.length > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-rehub-200 bg-rehub-50 px-3 py-1 text-xs font-semibold text-rehub-700">
              <CheckCircle2 className="h-3 w-3 text-rehub-600" />
              {t("selectedCount", { count: seleccionados.length })}
            </span>
          )}
        </div>
      </Reveal>

      {/* Chips grid */}
      <div className="px-6 lg:px-8 py-6">
        <Stagger className="flex flex-wrap gap-2.5">
          {OPCIONES_NECESIDADES.map((op) => {
            const isSelected = seleccionados.includes(op.id);
            return (
              <StaggerItem key={op.id}>
                <button
                  type="button"
                  onClick={() => toggle(op.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border border-rehub-500 bg-rehub-600 text-white shadow-glow hover:bg-rehub-700 hover:shadow-glow-lg"
                      : "border border-rehub-50 bg-rehub-50 text-rehub-800 hover:border-rehub-200 hover:bg-white hover:text-rehub-950",
                  ].join(" ")}
                  aria-pressed={isSelected}
                >
                  <span aria-hidden="true">{op.emoji}</span>
                  <span>{t(`options.${op.id}.label`)}</span>
                  {isSelected && (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
