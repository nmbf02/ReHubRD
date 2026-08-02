"use client";

/**
 * Agenda del profesional: las citas de su cartera en los próximos días, con el
 * riesgo de cada paciente al lado. Sirve para preparar la consulta sabiendo
 * quién llega abandonando el tratamiento — no para descubrirlo cuando ya está
 * sentado enfrente.
 */

import { useMemo } from "react";
import { CalendarDays, MapPin, User } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { useCohort } from "@/hooks/use-cohort";
import { APPOINTMENT_KIND_LABEL, isUpcoming, type Appointment } from "@/lib/appointments-store";
import { MiniBar, RiskDot, StageBadge } from "@/components/dashboard/PatientBits";
import type { CohortPatient } from "@/lib/demo-cohort";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
  userName: string | null;
}

interface AgendaEntry {
  cita: Appointment;
  patient: CohortPatient;
}

export function DoctorAgendaView({ userId, userName }: Props) {
  const { mine } = useCohort(userId, userName);

  const days = useMemo(() => {
    if (!mine) return [];
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 14);

    const entries: AgendaEntry[] = [];
    for (const patient of mine) {
      for (const cita of patient.snapshot.appointments) {
        const when = new Date(cita.datetime);
        if (isUpcoming(cita, now) && when <= horizon) entries.push({ cita, patient });
      }
    }
    entries.sort((a, b) => a.cita.datetime.localeCompare(b.cita.datetime));

    const grouped = new Map<string, AgendaEntry[]>();
    for (const entry of entries) {
      const key = entry.cita.datetime.slice(0, 10);
      grouped.set(key, [...(grouped.get(key) ?? []), entry]);
    }
    return Array.from(grouped.entries());
  }, [mine]);

  if (!mine) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  if (days.length === 0) {
    return (
      <section className="rounded-3xl border border-rehub-100 bg-white p-12 text-center shadow-card">
        <CalendarDays className="mx-auto h-8 w-8 text-rehub-300" />
        <p className="mt-3 text-sm text-rehub-900/60">
          No hay citas agendadas en los próximos 14 días.
        </p>
      </section>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      {days.map(([date, entries], index) => {
        const isToday = date === today;
        const parsed = new Date(`${date}T12:00`);

        return (
          <Reveal key={date} delay={Math.min(index * 0.03, 0.15)}>
            <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
              <header
                className={cn(
                  "flex items-baseline justify-between border-b px-6 py-3",
                  isToday ? "border-rehub-200 bg-rehub-50/70" : "border-rehub-100"
                )}
              >
                {/* `capitalize` pondría mayúscula a cada palabra («2 De Agosto»);
                    solo queremos la inicial de la frase. */}
                <h2
                  className={cn(
                    "text-sm font-semibold first-letter:uppercase",
                    isToday ? "text-rehub-800" : "text-rehub-900/75"
                  )}
                >
                  {isToday && (
                    <span className="mr-2 rounded-full bg-rehub-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
                      Hoy
                    </span>
                  )}
                  {parsed.toLocaleDateString("es-DO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <span className="text-xs tabular-nums text-rehub-900/50">
                  {entries.length} cita{entries.length === 1 ? "" : "s"}
                </span>
              </header>

              <ul className="divide-y divide-rehub-100">
                {entries.map(({ cita, patient }) => {
                  const adherence = patient.journey.signals.find((s) => s.id === "adherencia");
                  return (
                    <li key={`${patient.id}-${cita.id}`} className="flex flex-wrap items-center gap-4 px-6 py-3">
                      {/* `es-DO` produce «11:00 a. m.», que parte en dos líneas
                          en una columna estrecha. */}
                      <span className="w-20 shrink-0 whitespace-nowrap text-sm font-bold tabular-nums text-rehub-800">
                        {new Date(cita.datetime).toLocaleTimeString("es-DO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <RiskDot journey={patient.journey} />
                          <p className="text-sm font-semibold text-rehub-950">{patient.name}</p>
                          <StageBadge stage={patient.journey.stage} />
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-rehub-900/55">
                          <span>{APPOINTMENT_KIND_LABEL[cita.kind]} · {cita.title}</span>
                          {cita.place && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cita.place}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {cita.professional}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-rehub-900/40">
                          Adherencia
                        </p>
                        <MiniBar value={adherence?.value ?? null} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}
