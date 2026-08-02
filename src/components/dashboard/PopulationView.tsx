"use client";

/**
 * Del indicador al caso. El panel institucional abre por el número; esta
 * pantalla es donde ese número se convierte en personas concretas sobre las que
 * el aliado puede actuar.
 */

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { useCohort } from "@/hooks/use-cohort";
import { getRole, INSTITUTION_PROFILE, ROLE_UPDATED_EVENT, type InstitutionKind } from "@/lib/roles";
import { STAGES, STAGE_ORDER, type StageId } from "@/lib/journey";
import { hasReturnedToWork } from "@/lib/reintegration-store";
import { OPCIONES_TIPO_ACCIDENTE } from "@/types/profile";
import { MiniBar, RiskDot, StageBadge, riskOf } from "@/components/dashboard/PatientBits";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
  userName: string | null;
}

export function PopulationView({ userId, userName }: Props) {
  const { cohort } = useCohort(userId, userName);
  const [kind, setKind] = useState<InstitutionKind>("ars");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageId | "todos">("todos");
  const [onlyRisk, setOnlyRisk] = useState(false);

  useEffect(() => {
    const sync = () => setKind(getRole(userId).institution);
    sync();
    window.addEventListener(ROLE_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ROLE_UPDATED_EVENT, sync);
  }, [userId]);

  const rows = useMemo(() => {
    if (!cohort) return [];
    return cohort
      .filter((patient) => {
        if (onlyRisk && riskOf(patient.journey) === "ninguno") return false;
        if (stageFilter !== "todos" && patient.journey.stage !== stageFilter) return false;
        if (query && !patient.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort(
        (a, b) =>
          STAGE_ORDER.indexOf(a.journey.stage) - STAGE_ORDER.indexOf(b.journey.stage) ||
          (a.journey.recoveryIndex ?? 0) - (b.journey.recoveryIndex ?? 0)
      );
  }, [cohort, onlyRisk, stageFilter, query]);

  if (!cohort) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const profile = INSTITUTION_PROFILE[kind];
  const orgColumn = kind === "empresa" ? "Empresa" : kind === "centro" ? "Centro" : "ARS";

  return (
    <Reveal>
      <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rehub-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
            <Users className="h-5 w-5 text-rehub-600" />
            {rows.length} {profile.populationNoun}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar"
                className="w-36 rounded-xl border border-rehub-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-rehub-400"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as StageId | "todos")}
              className="rounded-xl border border-rehub-200 px-2.5 py-1.5 text-sm outline-none focus:border-rehub-400"
            >
              <option value="todos">Todas las etapas</option>
              {STAGE_ORDER.map((stageId) => (
                <option key={stageId} value={stageId}>
                  {STAGES[stageId].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOnlyRisk((value) => !value)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                onlyRisk
                  ? "bg-red-600 text-white"
                  : "border border-rehub-200 text-rehub-700 hover:bg-rehub-50"
              )}
            >
              Solo en riesgo
            </button>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-rehub-100 text-[11px] uppercase tracking-wider text-rehub-900/50">
                <th className="px-6 py-2.5 font-semibold">{profile.populationNoun}</th>
                <th className="px-3 py-2.5 font-semibold">{orgColumn}</th>
                <th className="px-3 py-2.5 font-semibold">Etapa</th>
                <th className="px-3 py-2.5 font-semibold">Adherencia</th>
                <th className="px-3 py-2.5 font-semibold">Terapias</th>
                <th className="px-3 py-2.5 font-semibold">Días</th>
                {kind === "empresa" && <th className="px-6 py-2.5 font-semibold">Retorno</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-rehub-100">
              {rows.map((patient) => {
                const adherence = patient.journey.signals.find((s) => s.id === "adherencia");
                const attendance = patient.journey.signals.find((s) => s.id === "asistencia");
                const returned = hasReturnedToWork(patient.snapshot.reintegration);

                return (
                  <tr key={patient.id} className="transition-colors hover:bg-rehub-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <RiskDot journey={patient.journey} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-rehub-950">
                            {patient.name}
                          </p>
                          <p className="truncate text-xs text-rehub-900/55">
                            {patient.age} a. · {OPCIONES_TIPO_ACCIDENTE[patient.accidentType]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-rehub-900/70">
                      {kind === "empresa"
                        ? patient.employer
                        : kind === "centro"
                          ? patient.center
                          : patient.insurer}
                    </td>
                    <td className="px-3 py-3">
                      <StageBadge stage={patient.journey.stage} />
                    </td>
                    <td className="px-3 py-3">
                      <MiniBar value={adherence?.value ?? null} />
                    </td>
                    <td className="px-3 py-3">
                      <MiniBar value={attendance?.value ?? null} />
                    </td>
                    <td className="px-3 py-3 text-sm tabular-nums text-rehub-900/70">
                      {patient.journey.daysSinceDischarge ?? "—"}
                    </td>
                    {kind === "empresa" && (
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            returned
                              ? "bg-rehub-100 text-rehub-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {returned ? "Reincorporado" : "De baja"}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Reveal>
  );
}
