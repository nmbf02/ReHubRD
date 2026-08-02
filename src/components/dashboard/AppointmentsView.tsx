"use client";

/**
 * Módulo 2 — Citas y terapias. Segunda pieza del MVP declarado en la tesis
 * (BR-12) y la que ataca el ausentismo, «uno de los principales causantes del
 * abandono terapéutico identificado en la encuesta» (tesis.txt:359).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Check,
  X,
  RotateCcw,
  Trash2,
  MapPin,
  User,
  TrendingUp,
  Ticket,
} from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  type Appointment,
  type AppointmentKind,
  APPOINTMENT_KIND_LABEL,
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENTS_UPDATED_EVENT,
  attendanceRate,
  getAppointments,
  isMissed,
  removeAppointment,
  upsertAppointment,
} from "@/lib/appointments-store";
import { BOOKING_COMMISSION } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

interface Draft {
  kind: AppointmentKind;
  title: string;
  professional: string;
  place: string;
  date: string;
  time: string;
  bookedThroughRehub: boolean;
}

const EMPTY_DRAFT: Draft = {
  kind: "fisioterapia",
  title: "",
  professional: "",
  place: "",
  date: "",
  time: "09:00",
  bookedThroughRehub: true,
};

export function AppointmentsView({ userId }: Props) {
  const [list, setList] = useState<Appointment[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [showForm, setShowForm] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const reload = useCallback(() => {
    setList(getAppointments(userId));
    setNow(new Date());
  }, [userId]);

  useEffect(() => {
    reload();
    window.addEventListener(APPOINTMENTS_UPDATED_EVENT, reload);
    return () => window.removeEventListener(APPOINTMENTS_UPDATED_EVENT, reload);
  }, [reload]);

  const { upcoming, past, attendance, commissionCount } = useMemo(() => {
    if (!now) return { upcoming: [], past: [], attendance: null, commissionCount: 0 };
    const upcomingList = list.filter(
      (cita) => cita.status !== "completada" && !isMissed(cita, now)
    );
    const pastList = list
      .filter((cita) => cita.status === "completada" || isMissed(cita, now))
      .reverse();
    return {
      upcoming: upcomingList,
      past: pastList,
      attendance: attendanceRate(list, now),
      commissionCount: list.filter((c) => c.bookedThroughRehub && c.status === "completada").length,
    };
  }, [list, now]);

  const submit = () => {
    if (!draft.title.trim() || !draft.date) return;
    upsertAppointment(
      {
        id: `cita-${Date.now().toString(36)}`,
        kind: draft.kind,
        title: draft.title.trim(),
        professional: draft.professional.trim() || "Por asignar",
        place: draft.place.trim() || undefined,
        datetime: `${draft.date}T${draft.time}`,
        status: "programada",
        bookedThroughRehub: draft.bookedThroughRehub,
        createdAt: new Date().toISOString(),
      },
      userId
    );
    setDraft(EMPTY_DRAFT);
    setShowForm(false);
    reload();
  };

  const setStatus = (cita: Appointment, status: Appointment["status"]) => {
    upsertAppointment({ ...cita, status }, userId);
    reload();
  };

  if (!now) {
    return <div className="h-56 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  return (
    <div className="space-y-6">
      {/* Asistencia: el indicador que este módulo alimenta */}
      <Reveal>
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
              <TrendingUp className="h-3.5 w-3.5" />
              Asistencia
            </p>
            {attendance === null ? (
              <p className="mt-2 text-sm text-rehub-900/55">Aún no tienes citas vencidas.</p>
            ) : (
              <>
                <p className="mt-1 text-2xl font-bold tabular-nums text-rehub-950">{attendance}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rehub-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      attendance >= 80 ? "bg-brand-gradient" : attendance >= 60 ? "bg-amber-400" : "bg-red-400"
                    )}
                    style={{ width: `${attendance}%` }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
              Próximas
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-rehub-950">{upcoming.length}</p>
            <p className="mt-1 text-xs text-rehub-900/55">
              Te avisamos antes de cada una.
            </p>
          </div>
          <div className="rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
              <Ticket className="h-3.5 w-3.5" />
              Reservadas por ReHub
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-rehub-950">{commissionCount}</p>
            <p className="mt-1 text-xs text-rehub-900/55">
              Sin costo para ti: la comisión de RD${BOOKING_COMMISSION} la paga el centro.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Alta de cita */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="flex items-center justify-between border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <CalendarDays className="h-5 w-5 text-rehub-600" />
              Próximas citas
            </h2>
            <button
              type="button"
              onClick={() => setShowForm((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rehub-600 px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-rehub-700"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancelar" : "Agendar"}
            </button>
          </header>

          {showForm && (
            <div className="border-b border-rehub-100 bg-rehub-50/40 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">Tipo</span>
                  <select
                    value={draft.kind}
                    onChange={(e) => setDraft({ ...draft, kind: e.target.value as AppointmentKind })}
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  >
                    {(Object.keys(APPOINTMENT_KIND_LABEL) as AppointmentKind[]).map((kind) => (
                      <option key={kind} value={kind}>
                        {APPOINTMENT_KIND_LABEL[kind]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">Motivo</span>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Terapia de rodilla"
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">
                    Profesional
                  </span>
                  <input
                    value={draft.professional}
                    onChange={(e) => setDraft({ ...draft, professional: e.target.value })}
                    placeholder="Dra. Marisol Taveras"
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">Lugar</span>
                  <input
                    value={draft.place}
                    onChange={(e) => setDraft({ ...draft, place: e.target.value })}
                    placeholder="Centro de Rehabilitación Cibao"
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">Fecha</span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-rehub-900/70">Hora</span>
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                    className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </label>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-rehub-900/75">
                <input
                  type="checkbox"
                  checked={draft.bookedThroughRehub}
                  onChange={(e) => setDraft({ ...draft, bookedThroughRehub: e.target.checked })}
                  className="h-4 w-4 rounded border-rehub-300 text-rehub-600"
                />
                Reservada a través de ReHub
              </label>
              <button
                type="button"
                onClick={submit}
                disabled={!draft.title.trim() || !draft.date}
                className="mt-4 w-full rounded-xl bg-rehub-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rehub-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
              >
                Guardar cita
              </button>
            </div>
          )}

          <div className="p-6">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-rehub-900/55">
                No tienes citas próximas. Agenda tu consulta de seguimiento o tu terapia.
              </p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((cita) => (
                  <li
                    key={cita.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-rehub-100 bg-rehub-50/30 px-4 py-3"
                  >
                    <DateBadge datetime={cita.datetime} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-rehub-950">{cita.title}</p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-rehub-900/60">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {cita.professional}
                        </span>
                        {cita.place && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cita.place}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatus(cita, "completada")}
                        title="Marcar como asistida"
                        className="inline-flex items-center gap-1 rounded-lg bg-rehub-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rehub-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Asistí
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(cita, "reprogramada")}
                        title="Reprogramar"
                        className="rounded-lg border border-rehub-200 p-1.5 text-rehub-600 transition-colors hover:bg-rehub-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeAppointment(cita.id, userId);
                          reload();
                        }}
                        title="Eliminar"
                        className="rounded-lg border border-rehub-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </Reveal>

      {/* Historial */}
      {past.length > 0 && (
        <Reveal delay={0.08}>
          <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
            <header className="border-b border-rehub-100 px-6 py-4">
              <h2 className="text-lg font-semibold tracking-tight text-rehub-950">
                Tu historial de terapias
              </h2>
              <p className="mt-0.5 text-sm text-rehub-900/60">
                Esto es lo que tu médico ve de tu cumplimiento.
              </p>
            </header>
            <ul className="divide-y divide-rehub-100">
              {past.map((cita) => {
                const missed = isMissed(cita, now);
                return (
                  <li key={cita.id} className="flex items-center gap-3 px-6 py-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        missed ? "bg-red-100 text-red-600" : "bg-rehub-100 text-rehub-700"
                      )}
                    >
                      {missed ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-rehub-950">{cita.title}</p>
                      <p className="text-xs text-rehub-900/55">
                        {new Date(cita.datetime).toLocaleDateString("es-DO", {
                          day: "numeric",
                          month: "long",
                        })}{" "}
                        · {cita.professional}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        missed ? "bg-red-50 text-red-700" : "bg-rehub-50 text-rehub-700"
                      )}
                    >
                      {missed ? "No asistió" : APPOINTMENT_STATUS_LABEL[cita.status]}
                    </span>
                    {missed && cita.status === "programada" && (
                      <button
                        type="button"
                        onClick={() => setStatus(cita, "completada")}
                        className="shrink-0 text-xs font-semibold text-rehub-700 hover:underline"
                      >
                        Sí asistí
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </Reveal>
      )}
    </div>
  );
}

function DateBadge({ datetime }: { datetime: string }) {
  const date = new Date(datetime);
  return (
    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-rehub-800 ring-1 ring-rehub-200">
      <span className="text-base font-bold leading-none tabular-nums">{date.getDate()}</span>
      <span className="text-[10px] font-medium uppercase leading-none text-rehub-900/55">
        {date.toLocaleDateString("es-DO", { month: "short" }).replace(".", "")}
      </span>
    </span>
  );
}
