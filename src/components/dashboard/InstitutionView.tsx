"use client";

/**
 * Panel institucional (ARS · Empresa · Centro de rehabilitación).
 *
 * Abre por el indicador que ESA institución compra, no por un listado de
 * pacientes: «cada aliado adquiere el servicio porque mejora un indicador
 * propio: adherencia, ocupación de agenda, siniestralidad o ausentismo
 * laboral» (tesis.txt:170, BR-07).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, TrendingUp, Users, ArrowRight, Info } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { useCohort } from "@/hooks/use-cohort";
import {
  getRole,
  INSTITUTION_PROFILE,
  ROLE_UPDATED_EVENT,
  type InstitutionKind,
} from "@/lib/roles";
import { STAGES, STAGE_ORDER, type StageId } from "@/lib/journey";
import { isMissed } from "@/lib/appointments-store";
import { hasReturnedToWork } from "@/lib/reintegration-store";
import { ROUTES } from "@/lib/routes";
import { MetricCard, riskOf } from "@/components/dashboard/PatientBits";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
  userName: string | null;
}

const STAGE_COLOR: Record<StageId, string> = {
  ingreso: "bg-sky-400",
  tratamiento: "bg-rehub-400",
  avance: "bg-emerald-400",
  reintegracion: "bg-violet-400",
  alta_rehub: "bg-rehub-700",
};

export function InstitutionView({ userId, userName }: Props) {
  const { cohort } = useCohort(userId, userName);
  const [kind, setKind] = useState<InstitutionKind>("ars");

  useEffect(() => {
    const sync = () => setKind(getRole(userId).institution);
    sync();
    window.addEventListener(ROLE_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ROLE_UPDATED_EVENT, sync);
  }, [userId]);

  const stats = useMemo(() => {
    if (!cohort) return null;
    const now = new Date();

    const adherences = cohort
      .map((patient) => patient.journey.signals.find((s) => s.id === "adherencia")?.value)
      .filter((value): value is number => typeof value === "number");
    const avgAdherence =
      adherences.length > 0
        ? Math.round(adherences.reduce((sum, value) => sum + value, 0) / adherences.length)
        : null;

    // "Abandonando" = alerta de riesgo alto. Es el mismo criterio que dispara
    // la notificación al médico: un solo umbral para toda la plataforma.
    const abandoning = cohort.filter((patient) => riskOf(patient.journey) === "alto");
    const abandonRate = Math.round((abandoning.length / cohort.length) * 100);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const missedSessions = cohort.reduce(
      (sum, patient) =>
        sum +
        patient.snapshot.appointments.filter(
          (cita) => isMissed(cita, now) && new Date(cita.datetime) >= thirtyDaysAgo
        ).length,
      0
    );

    const returned = cohort.filter((patient) => hasReturnedToWork(patient.snapshot.reintegration));
    const stillOut = cohort.filter(
      (patient) =>
        !hasReturnedToWork(patient.snapshot.reintegration) &&
        patient.journey.stage !== "alta_rehub"
    );
    const absenceDays = stillOut.reduce(
      (sum, patient) => sum + (patient.journey.daysSinceDischarge ?? 0),
      0
    );

    const byStage = STAGE_ORDER.map((stageId) => ({
      stageId,
      count: cohort.filter((patient) => patient.journey.stage === stageId).length,
    }));

    return {
      avgAdherence,
      abandoning,
      abandonRate,
      missedSessions,
      returnedRate: Math.round((returned.length / cohort.length) * 100),
      absenceDays,
      byStage,
      total: cohort.length,
    };
  }, [cohort]);

  if (!cohort || !stats) {
    return <div className="h-72 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const profile = INSTITUTION_PROFILE[kind];

  const headline =
    kind === "ars"
      ? {
          value: stats.avgAdherence === null ? "—" : `${stats.avgAdherence}%`,
          tone: (stats.avgAdherence ?? 100) < 70 ? ("warn" as const) : ("neutral" as const),
        }
      : kind === "empresa"
        ? { value: `${stats.returnedRate}%`, tone: "neutral" as const }
        : { value: `${stats.abandonRate}%`, tone: stats.abandonRate > 20 ? ("bad" as const) : ("neutral" as const) };

  return (
    <div className="space-y-6">
      {/* El indicador que justifica la licencia */}
      <Reveal>
        <section className="rounded-3xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/60 p-6 shadow-card lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-lg">
              <p className="flex items-center gap-2 text-sm font-semibold text-rehub-700">
                <Building2 className="h-4 w-4" />
                {profile.label}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-rehub-950">
                {profile.headlineMetric}
              </h2>
              <p className="mt-2 text-pretty leading-relaxed text-rehub-900/70">
                {profile.headlineHelp}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-5xl font-bold tabular-nums leading-none",
                  headline.tone === "bad"
                    ? "text-red-600"
                    : headline.tone === "warn"
                      ? "text-amber-600"
                      : "text-rehub-950"
                )}
              >
                {headline.value}
              </p>
              <p className="mt-1 text-xs font-medium text-rehub-900/55">
                sobre {stats.total} {profile.populationNoun}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Indicadores secundarios, según lo que esta institución mide */}
      <Reveal delay={0.05}>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={`${profile.populationNoun} activos`}
            value={String(stats.total)}
            help="En recuperación post-accidente"
          />
          <MetricCard
            label="En riesgo de abandono"
            value={String(stats.abandoning.length)}
            help={`${stats.abandonRate}% de la población`}
            tone={stats.abandoning.length > 0 ? "bad" : "good"}
          />
          {kind === "empresa" ? (
            <MetricCard
              label="Días de ausentismo"
              value={stats.absenceDays.toLocaleString("es-DO")}
              help="Acumulados de quienes aún no vuelven"
              tone="warn"
            />
          ) : (
            <MetricCard
              label="Terapias perdidas"
              value={String(stats.missedSessions)}
              help="Sesiones no asistidas en 30 días"
              tone={stats.missedSessions > 10 ? "warn" : "neutral"}
            />
          )}
          <MetricCard
            label="Adherencia media"
            value={stats.avgAdherence === null ? "—" : `${stats.avgAdherence}%`}
            help="Dosis cumplidas, 14 días"
            tone={(stats.avgAdherence ?? 100) < 70 ? "warn" : "neutral"}
          />
        </section>
      </Reveal>

      {/* El embudo del recorrido: dónde está parada la población */}
      <Reveal delay={0.08}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <TrendingUp className="h-5 w-5 text-rehub-600" />
              Dónde está tu población
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              El recorrido completo, del alta médica al alta ReHub.
            </p>
          </header>

          <div className="p-6">
            <div className="flex h-8 w-full overflow-hidden rounded-xl">
              {stats.byStage.map(({ stageId, count }) => {
                if (count === 0) return null;
                const pct = (count / stats.total) * 100;
                return (
                  <div
                    key={stageId}
                    style={{ width: `${pct}%` }}
                    title={`${STAGES[stageId].label}: ${count}`}
                    className={cn(
                      "flex items-center justify-center text-[11px] font-bold text-white transition-all",
                      STAGE_COLOR[stageId]
                    )}
                  >
                    {pct > 8 && count}
                  </div>
                );
              })}
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {stats.byStage.map(({ stageId, count }) => (
                <li key={stageId} className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STAGE_COLOR[stageId])} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-rehub-900">
                      {STAGES[stageId].label}
                    </span>
                    <span className="block text-[11px] tabular-nums text-rehub-900/55">
                      {count} {profile.populationNoun}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* Casos que necesitan gestión */}
      <Reveal delay={0.1}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rehub-100 px-6 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
                <Users className="h-5 w-5 text-rehub-600" />
                Casos que requieren gestión
              </h2>
              <p className="mt-0.5 text-sm text-rehub-900/60">
                Los que más encarecen el caso si nadie interviene.
              </p>
            </div>
            <Link
              href={ROUTES.population}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 px-3.5 py-2 text-sm font-semibold text-rehub-700 transition-colors hover:bg-rehub-50"
            >
              Ver toda la población
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          {stats.abandoning.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-rehub-900/60">
              Ningún caso en riesgo alto ahora mismo.
            </p>
          ) : (
            <ul className="divide-y divide-rehub-100">
              {stats.abandoning.slice(0, 6).map((patient) => (
                <li key={patient.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-rehub-950">
                      {patient.name}
                    </span>
                    <span className="block truncate text-xs text-rehub-900/55">
                      {kind === "empresa"
                        ? patient.employer
                        : kind === "centro"
                          ? patient.center
                          : patient.insurer}
                      {patient.journey.daysSinceDischarge !== null &&
                        ` · día ${patient.journey.daysSinceDischarge}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-red-700">
                    {patient.journey.alerts[0]?.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-rehub-100 bg-rehub-50/40 px-5 py-4">
          <p className="text-sm font-semibold text-rehub-900">
            {profile.plan} · RD${profile.monthlyFee.toLocaleString("es-DO")}/mes
          </p>
          <p className="flex items-center gap-1.5 text-xs text-rehub-900/60">
            <Info className="h-3.5 w-3.5" />
            Datos agregados de tus {profile.populationNoun}. El acceso del paciente es y seguirá siendo
            gratuito.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
