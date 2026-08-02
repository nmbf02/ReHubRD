"use client";

/**
 * Módulo 4 — Trámites y seguros. Responde a «uno de los vacíos más señalados
 * por los encuestados: la falta de orientación sobre los trámites
 * administrativos tras un accidente» (tesis.txt:363).
 *
 * Los pasos se filtran por tipo de accidente y cobertura, así que la lista es
 * la de esta persona y no un manual genérico.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Check, Clock, Minus, AlertCircle, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  type PaperworkState,
  type PaperworkStatus,
  type PaperworkStepDef,
  PAPERWORK_STATUS_LABEL,
  PAPERWORK_UPDATED_EVENT,
  applicableSteps,
  getPaperwork,
  paperworkScore,
  setStepNote,
  setStepStatus,
} from "@/lib/paperwork-store";
import { getPerfil } from "@/lib/profile-store";
import { daysSince } from "@/lib/journey";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

const STATUS_CYCLE: PaperworkStatus[] = ["pendiente", "en_proceso", "resuelto", "no_aplica"];

const STATUS_STYLE: Record<PaperworkStatus, string> = {
  pendiente: "border-rehub-200 bg-white text-rehub-900/45",
  en_proceso: "border-amber-300 bg-amber-50 text-amber-700",
  resuelto: "border-rehub-400 bg-rehub-500 text-white",
  no_aplica: "border-rehub-100 bg-rehub-50 text-rehub-900/35",
};

export function PaperworkView({ userId }: Props) {
  const [state, setState] = useState<PaperworkState>({ status: {}, notes: {}, updatedAt: "" });
  const [steps, setSteps] = useState<PaperworkStepDef[]>([]);
  const [accidentDate, setAccidentDate] = useState<string | undefined>();
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  const reload = useCallback(() => {
    const perfil = getPerfil(userId ?? undefined);
    setSteps(
      applicableSteps(
        perfil?.situacionAccidente?.tipoAccidente,
        perfil?.situacionAccidente?.tipoSeguro
      )
    );
    setAccidentDate(
      perfil?.situacionAccidente?.fechaAccidente ?? perfil?.situacionAccidente?.fechaAltaMedica
    );
    setState(getPaperwork(userId));
    setNow(new Date());
  }, [userId]);

  useEffect(() => {
    reload();
    window.addEventListener(PAPERWORK_UPDATED_EVENT, reload);
    return () => window.removeEventListener(PAPERWORK_UPDATED_EVENT, reload);
  }, [reload]);

  const score = useMemo(() => paperworkScore(steps, state), [steps, state]);
  const resolved = steps.filter((step) => state.status[step.id] === "resuelto").length;

  const cycle = (stepId: string) => {
    const current = state.status[stepId] ?? "pendiente";
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    setState(setStepStatus(stepId, next, userId));
  };

  if (!now) {
    return <div className="h-56 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const elapsed = daysSince(accidentDate, now);

  return (
    <div className="space-y-6">
      <Reveal>
        <section className="rounded-3xl border border-rehub-100 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
                <FileText className="h-5 w-5 text-rehub-600" />
                Tu expediente
              </h2>
              <p className="mt-0.5 text-sm text-rehub-900/60">
                {resolved} de {steps.length} pasos resueltos
                {elapsed !== null && ` · día ${elapsed} desde el accidente`}
              </p>
            </div>
            {score !== null && (
              <div className="min-w-[140px]">
                <p className="text-right text-2xl font-bold tabular-nums text-rehub-950">{score}%</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-rehub-100">
                  <div
                    className="h-full rounded-full bg-brand-gradient transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 rounded-xl bg-rehub-50/60 px-4 py-3 text-xs leading-relaxed text-rehub-900/65">
            Orientación general adaptada a tu tipo de accidente y tu cobertura. No sustituye la
            asesoría de tu ARS ni de un abogado. Toca el círculo para cambiar el estado de cada paso.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <ol className="space-y-2">
          {steps.map((step, index) => {
            const status = state.status[step.id] ?? "pendiente";
            const isOpen = openStep === step.id;
            const deadline =
              step.deadlineDays !== undefined && elapsed !== null
                ? step.deadlineDays - elapsed
                : null;
            const overdue = deadline !== null && deadline < 0 && status !== "resuelto" && status !== "no_aplica";
            const urgent = deadline !== null && deadline >= 0 && deadline <= 7 && status === "pendiente";

            return (
              <li
                key={step.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-soft transition-colors",
                  overdue ? "border-red-200" : "border-rehub-100"
                )}
              >
                <div className="flex items-start gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => cycle(step.id)}
                    title={`Estado: ${PAPERWORK_STATUS_LABEL[status]} — toca para cambiar`}
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-105",
                      STATUS_STYLE[status]
                    )}
                  >
                    {status === "resuelto" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {status === "en_proceso" && <Clock className="h-3.5 w-3.5" />}
                    {status === "no_aplica" && <Minus className="h-3.5 w-3.5" />}
                    {status === "pendiente" && (
                      <span className="text-[11px] font-bold tabular-nums">{index + 1}</span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setOpenStep(isOpen ? null : step.id)}
                      className="flex w-full items-start gap-2 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm font-semibold",
                            status === "resuelto" || status === "no_aplica"
                              ? "text-rehub-900/45"
                              : "text-rehub-950"
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              status === "resuelto"
                                ? "bg-rehub-50 text-rehub-700"
                                : status === "en_proceso"
                                  ? "bg-amber-50 text-amber-700"
                                  : status === "no_aplica"
                                    ? "bg-rehub-50 text-rehub-900/45"
                                    : "bg-rehub-50 text-rehub-900/55"
                            )}
                          >
                            {PAPERWORK_STATUS_LABEL[status]}
                          </span>
                          {overdue && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              <AlertCircle className="h-3 w-3" />
                              Plazo vencido hace {Math.abs(deadline!)} días
                            </span>
                          )}
                          {urgent && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Te quedan {deadline} días
                            </span>
                          )}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "mt-1 h-4 w-4 shrink-0 text-rehub-400 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 space-y-3 border-t border-rehub-100 pt-3">
                        <p className="text-sm leading-relaxed text-rehub-900/70">{step.help}</p>
                        {step.needs && (
                          <p className="text-xs text-rehub-900/60">
                            <span className="font-semibold text-rehub-800">Necesitas:</span>{" "}
                            {step.needs}
                          </p>
                        )}
                        <input
                          defaultValue={state.notes[step.id] ?? ""}
                          onBlur={(event) =>
                            setState(setStepNote(step.id, event.target.value, userId))
                          }
                          placeholder="Anota tu número de caso o con quién hablaste"
                          className="w-full rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </div>
  );
}
