"use client";

/**
 * La mitad que le faltaba al módulo de medicamentos: el **cumplimiento**.
 *
 * La receta ya se gestionaba en `MedicationsView`; lo que no existía era marcar
 * las dosis, que es lo que la tesis pide de forma expresa —«cada dosis tomada o
 * no registrada construye un historial de cumplimiento» (tesis.txt:357)— y de
 * donde salen la adherencia y la alerta al médico.
 *
 * Va encima de la receta porque marcar una dosis es la acción diaria; editar la
 * receta se hace una vez.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, Pill, TrendingUp, Undo2 } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { getMedications, MEDICATIONS_UPDATED_EVENT } from "@/lib/medications-store";
import {
  ADHERENCE_UPDATED_EVENT,
  adherenceRate,
  dosesForDay,
  getDoseLog,
  markDose,
} from "@/lib/adherence-store";
import { toDateKey } from "@/lib/emotional-store";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

export function AdherencePanel({ userId }: Props) {
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  const reload = useCallback(() => {
    setNow(new Date());
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(MEDICATIONS_UPDATED_EVENT, reload);
    window.addEventListener(ADHERENCE_UPDATED_EVENT, reload);
    return () => {
      window.removeEventListener(MEDICATIONS_UPDATED_EVENT, reload);
      window.removeEventListener(ADHERENCE_UPDATED_EVENT, reload);
    };
  }, [reload]);

  const data = useMemo(() => {
    if (!now) return null;
    const meds = getMedications(userId);
    const log = getDoseLog(userId);
    const week: Array<{ date: Date; taken: number; due: number }> = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setDate(day.getDate() - offset);
      const doses = dosesForDay(meds, log, day, now).filter((dose) => dose.due);
      week.push({
        date: day,
        taken: doses.filter((dose) => dose.mark === "taken").length,
        due: doses.length,
      });
    }
    return {
      meds,
      today: dosesForDay(meds, log, now, now),
      rate: adherenceRate(meds, log, now),
      week,
    };
    // `tick` fuerza el recálculo tras marcar una dosis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, now, tick]);

  if (!now || !data) {
    return <div className="mb-6 h-40 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  if (data.meds.length === 0) return null;

  const pending = data.today.filter((dose) => dose.due && dose.mark === null).length;

  return (
    <Reveal>
      <section className="mb-6 overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rehub-100 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <Pill className="h-5 w-5 text-rehub-600" />
              Tus dosis de hoy
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              {pending > 0
                ? `${pending} sin marcar. Una dosis sin registrar cuenta como no tomada.`
                : "Todo marcado por ahora."}
            </p>
          </div>

          {data.rate !== null && (
            <div className="text-right">
              <p className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
                <TrendingUp className="h-3.5 w-3.5" />
                Adherencia (14 días)
              </p>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  data.rate >= 70 ? "text-rehub-950" : "text-amber-600"
                )}
              >
                {data.rate}%
              </p>
              {data.rate < 70 && (
                <p className="text-[11px] font-medium text-amber-700">
                  Bajo el 70 %: tu médico recibe una alerta
                </p>
              )}
            </div>
          )}
        </header>

        <div className="p-6">
          <ul className="space-y-1.5">
            {data.today.map((dose) => (
              <li
                key={dose.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  dose.mark === "taken" && "border-rehub-100 bg-rehub-50/60",
                  dose.mark === "skipped" && "border-red-100 bg-red-50/50",
                  dose.mark === null && dose.due && "border-amber-200 bg-amber-50/40",
                  dose.mark === null && !dose.due && "border-rehub-100 bg-white"
                )}
              >
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-rehub-900/70">
                  {dose.time}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-rehub-950">
                  {dose.medName}
                  {dose.dose && <span className="text-rehub-900/50"> · {dose.dose}</span>}
                </span>

                {dose.mark === null ? (
                  <span className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        markDose(dose.medId, now, dose.time, "taken", userId);
                        reload();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rehub-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rehub-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      La tomé
                    </button>
                    {dose.due && (
                      <button
                        type="button"
                        onClick={() => {
                          markDose(dose.medId, now, dose.time, "skipped", userId);
                          reload();
                        }}
                        title="No la tomé"
                        className="rounded-lg border border-rehub-200 p-1.5 text-rehub-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        dose.mark === "taken"
                          ? "bg-rehub-100 text-rehub-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {dose.mark === "taken" ? "Tomada" : "No tomada"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        markDose(dose.medId, now, dose.time, null, userId);
                        reload();
                      }}
                      title="Deshacer"
                      className="rounded-lg p-1 text-rehub-400 transition-colors hover:bg-rehub-50 hover:text-rehub-700"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Tu semana, de un vistazo */}
          <div className="mt-5 border-t border-rehub-100 pt-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
              Tu semana
            </p>
            <div className="flex items-end gap-1.5">
              {data.week.map(({ date, taken, due }) => {
                const pct = due === 0 ? null : Math.round((taken / due) * 100);
                return (
                  <div key={toDateKey(date)} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-14 w-full items-end overflow-hidden rounded-md bg-rehub-50">
                      {pct !== null && (
                        <div
                          title={`${taken} de ${due} dosis`}
                          style={{ height: `${Math.max(pct, 6)}%` }}
                          className={cn(
                            "w-full rounded-md transition-all",
                            pct >= 70 ? "bg-rehub-400" : pct >= 40 ? "bg-amber-300" : "bg-red-300"
                          )}
                        />
                      )}
                    </div>
                    <span className="text-[9px] font-medium uppercase text-rehub-900/40">
                      {date.toLocaleDateString("es-DO", { weekday: "narrow" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
