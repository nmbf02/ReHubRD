"use client";

/**
 * Panel del médico tratante — la tercera pieza del MVP que la tesis declara
 * (BR-12) y que no existía.
 *
 * Abre por las **alertas**, no por el listado de pacientes, porque eso es lo
 * que el plan Médico Premium compra: enterarse de que alguien está abandonando
 * «sin depender del reporte verbal del paciente en la próxima consulta»
 * (tesis.txt:366).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, Check, Phone, Users, ChevronRight, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { useCohort } from "@/hooks/use-cohort";
import { DOCTOR_PLAN } from "@/lib/roles";
import { ROUTES } from "@/lib/routes";
import { MetricCard, StageBadge, MiniBar, riskOf } from "@/components/dashboard/PatientBits";
import type { CohortPatient } from "@/lib/demo-cohort";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
  userName: string | null;
}

export function DoctorAlertsView({ userId, userName }: Props) {
  const { mine } = useCohort(userId, userName);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const rows = useMemo(() => {
    if (!mine) return [];
    return mine
      .filter((patient) => patient.journey.alerts.length > 0)
      .sort((a, b) => {
        const rank = (patient: CohortPatient) => (riskOf(patient.journey) === "alto" ? 0 : 1);
        return rank(a) - rank(b) || b.journey.alerts.length - a.journey.alerts.length;
      });
  }, [mine]);

  if (!mine) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const open = rows.filter((patient) => !dismissed.includes(patient.id));
  const highRisk = open.filter((patient) => riskOf(patient.journey) === "alto").length;
  const adherences = mine.map((p) => p.journey.signals.find((s) => s.id === "adherencia")?.value);
  const measured = adherences.filter((value): value is number => value !== null && value !== undefined);
  const avgAdherence =
    measured.length > 0
      ? Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length)
      : null;

  return (
    <div className="space-y-6">
      <Reveal>
        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Requieren intervención"
            value={String(highRisk)}
            help="Riesgo alto ahora mismo"
            tone={highRisk > 0 ? "bad" : "good"}
          />
          <MetricCard
            label="Pacientes activos"
            value={String(mine.length)}
            help="En recuperación post-accidente"
          />
          <MetricCard
            label="Adherencia media"
            value={avgAdherence === null ? "—" : `${avgAdherence}%`}
            help="De toda tu cartera, 14 días"
            tone={avgAdherence !== null && avgAdherence < 70 ? "warn" : "neutral"}
          />
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rehub-100 px-6 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
                <BellRing className="h-5 w-5 text-rehub-600" />
                Alertas abiertas
              </h2>
              <p className="mt-0.5 text-sm text-rehub-900/60">
                Generadas automáticamente por lo que el paciente registra — o deja de registrar.
              </p>
            </div>
            <Link
              href={ROUTES.patients}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 px-3.5 py-2 text-sm font-semibold text-rehub-700 transition-colors hover:bg-rehub-50"
            >
              <Users className="h-4 w-4" />
              Ver toda la cartera
            </Link>
          </header>

          {open.length === 0 ? (
            <p className="flex items-center justify-center gap-2 px-6 py-12 text-sm font-medium text-rehub-800">
              <Check className="h-4 w-4 text-rehub-600" />
              Ninguna alerta abierta. Toda tu cartera va al día.
            </p>
          ) : (
            <ul className="divide-y divide-rehub-100">
              {open.map((patient) => {
                const risk = riskOf(patient.journey);
                const adherence = patient.journey.signals.find((s) => s.id === "adherencia");
                const isSelf = patient.id === "sesion-actual";

                return (
                  <li
                    key={patient.id}
                    className={cn(
                      "px-6 py-4 transition-colors",
                      risk === "alto" ? "bg-red-50/30" : "hover:bg-rehub-50/40"
                    )}
                  >
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                      <span
                        className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          risk === "alto" ? "bg-red-500" : "bg-amber-400"
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-rehub-950">{patient.name}</p>
                          <StageBadge stage={patient.journey.stage} />
                          {isSelf && (
                            <span className="rounded-full bg-rehub-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                              en vivo
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-rehub-900/55">
                          {patient.age} años · {patient.insurer}
                          {patient.journey.daysSinceDischarge !== null &&
                            ` · día ${patient.journey.daysSinceDischarge} desde el alta`}
                        </p>

                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {patient.journey.alerts.map((alert) => (
                            <li
                              key={alert.id}
                              className={cn(
                                "rounded-lg px-2.5 py-1 text-[11px] font-medium",
                                alert.severity === "alta"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              )}
                            >
                              {alert.label} · {alert.detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <MiniBar value={adherence?.value ?? null} />
                        <div className="flex gap-1.5">
                          <a
                            href="tel:8090000000"
                            className="inline-flex items-center gap-1 rounded-lg bg-rehub-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rehub-700"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Contactar
                          </a>
                          <button
                            type="button"
                            onClick={() => setDismissed((list) => [...list, patient.id])}
                            className="rounded-lg border border-rehub-200 px-2.5 py-1.5 text-xs font-medium text-rehub-700 transition-colors hover:bg-rehub-50"
                          >
                            Atendida
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Reveal>

      {/* Cómo se sostiene el panel. Aquí sí se nombra el plan: el paciente nunca lo ve (BR-06). */}
      <Reveal delay={0.08}>
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-rehub-100 bg-rehub-50/40 px-5 py-4">
          <p className="text-sm font-semibold text-rehub-900">
            {DOCTOR_PLAN.label} · RD${DOCTOR_PLAN.monthlyFee.toLocaleString("es-DO")}/mes
          </p>
          <p className="flex items-center gap-1.5 text-xs text-rehub-900/60">
            <Clock className="h-3.5 w-3.5" />
            Historial, reportes automáticos y alertas por incumplimiento. Tus pacientes no pagan nada.
          </p>
          <Link
            href={ROUTES.agenda}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rehub-700 hover:underline"
          >
            Ver agenda
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
