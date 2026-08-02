"use client";

/**
 * Módulo 5 — Monitoreo de progreso. Es el módulo agregador: «reúne la
 * información generada por los demás módulos (cumplimiento de medicamentos,
 * asistencia a terapias, avance en trámites) y la traduce en un panorama
 * general del estado de recuperación» (tesis.txt:365).
 *
 * Incluye a propósito una sección con lo que el médico está viendo. Es la
 * traducción honesta de BR-11: si el sistema le avisa al médico, el paciente
 * tiene derecho a saber qué le avisó.
 */

import Link from "next/link";
import { TrendingUp, Check, Stethoscope, Info } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { usePatientJourney } from "@/hooks/use-patient-journey";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { STAGES, STAGE_ORDER, type Signal } from "@/lib/journey";
import { DOCTOR_PLAN } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

export function ProgressView({ userId }: Props) {
  const mounted = useIsClientMounted();
  const { journey } = usePatientJourney(userId);

  if (!mounted || !journey) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const { signals, recoveryIndex, milestones, alerts, stage } = journey;
  const measured = signals.filter((signal) => signal.value !== null);
  const currentIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div className="space-y-6">
      {/* Índice compuesto */}
      <Reveal>
        <section className="rounded-3xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-6 shadow-card lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
                <TrendingUp className="h-5 w-5 text-rehub-600" />
                Índice de recuperación
              </h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-rehub-900/65">
                Es el promedio de las señales que ya tienen datos. Lo que todavía no ha empezado no
                cuenta como cero: simplemente no entra todavía.
              </p>
            </div>
            {recoveryIndex !== null && (
              <p className="text-5xl font-bold tabular-nums leading-none text-rehub-950">
                {recoveryIndex}
                <span className="text-lg font-medium text-rehub-900/40">/100</span>
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {signals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>

          {measured.length === 0 && (
            <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-rehub-900/65">
              Todavía no hay nada que medir. En cuanto marques una dosis o completes una cita, esto se
              llena solo.
            </p>
          )}
        </section>
      </Reveal>

      {/* Lo que tu médico está viendo */}
      <Reveal delay={0.05}>
        <section
          className={cn(
            "overflow-hidden rounded-3xl border shadow-card",
            alerts.length > 0 ? "border-amber-200 bg-amber-50/30" : "border-rehub-100 bg-white"
          )}
        >
          <header className="border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <Stethoscope className="h-5 w-5 text-rehub-600" />
              Lo que tu médico está viendo
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              Si algo se sale de lo esperado, ReHub le avisa sin esperar a tu próxima consulta.
            </p>
          </header>
          <div className="p-6">
            {alerts.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-medium text-rehub-800">
                <Check className="h-4 w-4 text-rehub-600" />
                Ninguna alerta. Tu médico no tiene motivo para intervenir ahora mismo.
              </p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        alert.severity === "alta" ? "bg-red-500" : "bg-amber-400"
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-rehub-950">
                        {alert.label}
                      </span>
                      <span className="block text-xs text-rehub-900/60">{alert.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 px-4 py-3 text-xs leading-relaxed text-rehub-900/60">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rehub-500" />
              Tu médico ve este panel si tiene el plan {DOCTOR_PLAN.label}. Para ti ReHub es y seguirá
              siendo gratis.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Todo el recorrido */}
      <Reveal delay={0.08}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="border-b border-rehub-100 px-6 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-rehub-950">Tu recorrido completo</h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              {milestones.filter((m) => m.done).length} de {milestones.length} hitos cumplidos
            </p>
          </header>
          <div className="divide-y divide-rehub-100">
            {STAGE_ORDER.filter((id) => id !== "alta_rehub").map((stageId, index) => {
              const stageDef = STAGES[stageId];
              const stageMilestones = milestones.filter((m) => m.stage === stageId);
              const doneCount = stageMilestones.filter((m) => m.done).length;
              const isCurrent = index === currentIndex;

              return (
                <div key={stageId} className={cn("px-6 py-4", isCurrent && "bg-rehub-50/40")}>
                  <div className="mb-2.5 flex items-baseline justify-between gap-2">
                    <h3
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent ? "text-rehub-800" : "text-rehub-900/70"
                      )}
                    >
                      <span className="tabular-nums opacity-60">{stageDef.step}.</span>{" "}
                      {stageDef.label}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-rehub-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Aquí estás
                        </span>
                      )}
                    </h3>
                    <span className="shrink-0 text-xs tabular-nums text-rehub-900/50">
                      {doneCount}/{stageMilestones.length}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {stageMilestones.map((milestone) => (
                      <li key={milestone.id}>
                        <Link
                          href={milestone.href}
                          className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-white"
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              milestone.done
                                ? "border-rehub-500 bg-rehub-500 text-white"
                                : "border-rehub-200"
                            )}
                          >
                            {milestone.done && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                          </span>
                          <span
                            className={cn(
                              "text-[13px]",
                              milestone.done
                                ? "text-rehub-900/50 line-through decoration-rehub-200"
                                : "text-rehub-900/75"
                            )}
                          >
                            {milestone.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function SignalRow({ signal }: { signal: Signal }) {
  const hasData = signal.value !== null;
  const value = signal.value ?? 0;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-rehub-100 bg-white/80 px-4 py-3">
      <div className="w-36 shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            hasData ? "text-rehub-950" : "text-rehub-900/40"
          )}
        >
          {signal.label}
        </p>
        <p className="text-[11px] leading-tight text-rehub-900/50">{signal.detail}</p>
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-rehub-100">
        {hasData && (
          <div
            className={cn(
              "h-full rounded-full transition-all",
              value >= 70 ? "bg-brand-gradient" : value >= 50 ? "bg-amber-400" : "bg-red-400"
            )}
            style={{ width: `${value}%` }}
          />
        )}
      </div>
      <span
        className={cn(
          "w-12 shrink-0 text-right text-sm font-bold tabular-nums",
          hasData ? "text-rehub-950" : "text-rehub-900/30"
        )}
      >
        {hasData ? `${value}%` : "—"}
      </span>
    </div>
  );
}
