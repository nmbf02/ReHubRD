"use client";

/**
 * La cartera del médico. Lo que la tesis llama «consulta del historial del
 * paciente» y «recepción de reportes automáticos de progreso» (tesis.txt:157).
 *
 * Maestro-detalle en una sola pantalla: se elige un paciente y se abre su
 * recorrido completo, con las mismas señales que él ve — porque son las mismas
 * (ADR 0003).
 */

import { useMemo, useState } from "react";
import { Search, Users, Check, X, Pill, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { useCohort } from "@/hooks/use-cohort";
import { STAGES, STAGE_ORDER } from "@/lib/journey";
import { isMissed, APPOINTMENT_KIND_LABEL } from "@/lib/appointments-store";
import { OPCIONES_TIPO_ACCIDENTE } from "@/types/profile";
import { MiniBar, RiskDot, StageBadge, riskOf } from "@/components/dashboard/PatientBits";
import { IssuePrescription } from "@/components/dashboard/IssuePrescription";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
  userName: string | null;
}

type Filter = "todos" | "riesgo" | "alta";

export function DoctorPatientsView({ userId, userName }: Props) {
  const { mine } = useCohort(userId, userName);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!mine) return [];
    return mine
      .filter((patient) => {
        if (filter === "riesgo" && riskOf(patient.journey) === "ninguno") return false;
        if (filter === "alta" && patient.journey.stage !== "alta_rehub") return false;
        if (query && !patient.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort(
        (a, b) =>
          STAGE_ORDER.indexOf(a.journey.stage) - STAGE_ORDER.indexOf(b.journey.stage) ||
          (a.journey.recoveryIndex ?? 0) - (b.journey.recoveryIndex ?? 0)
      );
  }, [mine, filter, query]);

  const selected = mine?.find((patient) => patient.id === selectedId) ?? null;

  if (!mine) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <Users className="h-5 w-5 text-rehub-600" />
              {rows.length} paciente{rows.length === 1 ? "" : "s"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rehub-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar"
                  className="w-40 rounded-xl border border-rehub-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-rehub-400"
                />
              </div>
              {(["todos", "riesgo", "alta"] as Filter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === option
                      ? "bg-rehub-600 text-white"
                      : "border border-rehub-200 text-rehub-700 hover:bg-rehub-50"
                  )}
                >
                  {option === "todos" ? "Todos" : option === "riesgo" ? "Con alertas" : "De alta"}
                </button>
              ))}
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-rehub-100 text-[11px] uppercase tracking-wider text-rehub-900/50">
                  <th className="px-6 py-2.5 font-semibold">Paciente</th>
                  <th className="px-3 py-2.5 font-semibold">Etapa</th>
                  <th className="px-3 py-2.5 font-semibold">Adherencia</th>
                  <th className="px-3 py-2.5 font-semibold">Terapias</th>
                  <th className="px-3 py-2.5 font-semibold">Índice</th>
                  <th className="px-6 py-2.5 font-semibold">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rehub-100">
                {rows.map((patient) => {
                  const adherence = patient.journey.signals.find((s) => s.id === "adherencia");
                  const attendance = patient.journey.signals.find((s) => s.id === "asistencia");
                  const isSelected = patient.id === selectedId;

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedId(isSelected ? null : patient.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-rehub-50" : "hover:bg-rehub-50/50"
                      )}
                    >
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
                      <td className="px-3 py-3">
                        <StageBadge stage={patient.journey.stage} />
                      </td>
                      <td className="px-3 py-3">
                        <MiniBar value={adherence?.value ?? null} />
                      </td>
                      <td className="px-3 py-3">
                        <MiniBar value={attendance?.value ?? null} />
                      </td>
                      <td className="px-3 py-3 text-sm font-bold tabular-nums text-rehub-950">
                        {patient.journey.recoveryIndex ?? "—"}
                      </td>
                      <td className="px-6 py-3">
                        {patient.journey.alerts.length === 0 ? (
                          <span className="text-xs text-rehub-900/40">—</span>
                        ) : (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              riskOf(patient.journey) === "alto"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {patient.journey.alerts.length}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {selected && (
        <Reveal>
          <section className="overflow-hidden rounded-3xl border border-rehub-200 bg-white shadow-card">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rehub-100 bg-rehub-50/50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-rehub-950">
                  {selected.name}
                </h3>
                <p className="mt-0.5 text-sm text-rehub-900/60">
                  {OPCIONES_TIPO_ACCIDENTE[selected.accidentType]} · {selected.insurer} ·{" "}
                  {selected.center}
                  {selected.journey.daysSinceDischarge !== null &&
                    ` · día ${selected.journey.daysSinceDischarge} desde el alta`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IssuePrescription
                  doctorName={selected.doctorName}
                  // La receta se ata a la cuenta cuando el paciente es el de la
                  // sesión; los de la cohorte de demostración no tienen cuenta.
                  patientId={selected.id === "sesion-actual" ? (userId ?? null) : null}
                  patientName={selected.name.replace(" (tu sesión)", "")}
                  center={selected.center}
                />
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg p-1.5 text-rehub-500 transition-colors hover:bg-white"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="grid gap-6 p-6 lg:grid-cols-2">
              {/* Señales */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-rehub-900/50">
                  Señales de recuperación
                </h4>
                <ul className="space-y-2">
                  {selected.journey.signals.map((signal) => (
                    <li key={signal.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm text-rehub-900">{signal.label}</span>
                        <span className="block text-[11px] text-rehub-900/50">{signal.detail}</span>
                      </span>
                      <MiniBar value={signal.value} />
                    </li>
                  ))}
                </ul>

                <h4 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-rehub-900/50">
                  Recorrido
                </h4>
                <div className="space-y-1.5">
                  {STAGE_ORDER.filter((id) => id !== "alta_rehub").map((stageId) => {
                    const stageMilestones = selected.journey.milestones.filter(
                      (m) => m.stage === stageId
                    );
                    const doneCount = stageMilestones.filter((m) => m.done).length;
                    return (
                      <div key={stageId} className="flex items-center gap-2 text-xs">
                        <span className="w-24 shrink-0 text-rehub-900/65">
                          {STAGES[stageId].label}
                        </span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-rehub-100">
                          <span
                            className="block h-full rounded-full bg-rehub-400"
                            style={{ width: `${(doneCount / stageMilestones.length) * 100}%` }}
                          />
                        </span>
                        <span className="w-8 shrink-0 text-right tabular-nums text-rehub-900/55">
                          {doneCount}/{stageMilestones.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tratamiento y citas */}
              <div>
                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rehub-900/50">
                  <Pill className="h-3.5 w-3.5" />
                  Tratamiento actual
                </h4>
                {selected.snapshot.medications.length === 0 ? (
                  <p className="text-sm text-rehub-900/50">Sin receta cargada.</p>
                ) : (
                  <ul className="space-y-1">
                    {selected.snapshot.medications.map((med) => (
                      <li
                        key={med.id}
                        className="flex items-center justify-between rounded-lg bg-rehub-50/60 px-3 py-1.5 text-sm"
                      >
                        <span className="text-rehub-950">
                          {med.name}
                          {med.dose && <span className="text-rehub-900/50"> · {med.dose}</span>}
                        </span>
                        <span className="text-xs tabular-nums text-rehub-900/55">
                          {med.times.length}×/día
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <h4 className="mb-3 mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rehub-900/50">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Últimas citas
                </h4>
                <ul className="space-y-1">
                  {selected.snapshot.appointments
                    .slice(-5)
                    .reverse()
                    .map((cita) => {
                      const missed = isMissed(cita, new Date());
                      return (
                        <li key={cita.id} className="flex items-center gap-2 text-sm">
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                              cita.status === "completada"
                                ? "bg-rehub-100 text-rehub-700"
                                : missed
                                  ? "bg-red-100 text-red-600"
                                  : "bg-rehub-50 text-rehub-500"
                            )}
                          >
                            {cita.status === "completada" ? (
                              <Check className="h-3 w-3" />
                            ) : missed ? (
                              <X className="h-3 w-3" />
                            ) : (
                              <CalendarDays className="h-3 w-3" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-rehub-900/80">
                            {APPOINTMENT_KIND_LABEL[cita.kind]}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-rehub-900/50">
                            {new Date(cita.datetime).toLocaleDateString("es-DO", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </li>
                      );
                    })}
                </ul>

                {selected.journey.alerts.length > 0 && (
                  <>
                    <h4 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-red-700/70">
                      Alertas activas
                    </h4>
                    <ul className="space-y-1">
                      {selected.journey.alerts.map((alert) => (
                        <li
                          key={alert.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-800"
                        >
                          <strong className="font-semibold">{alert.label}</strong> · {alert.detail}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
