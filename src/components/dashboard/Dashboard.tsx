"use client";

/**
 * «¿Dónde estoy hoy?» — la pantalla de inicio del paciente.
 *
 * Sustituye al dashboard anterior, que abría con una barra de «progreso» que en
 * realidad medía campos llenos del formulario de perfil (ADR 0003). Ahora abre
 * con la etapa del recorrido, lo que toca hoy y qué falta exactamente para
 * pasar a la etapa siguiente.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Phone,
  Pill,
  CalendarDays,
  HeartPulse,
  PartyPopper,
  Clock,
  Flag,
} from "lucide-react";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { usePatientJourney } from "@/hooks/use-patient-journey";
import { getAccountData } from "@/lib/account-store";
import { getRole, ROLE_UPDATED_EVENT } from "@/lib/roles";
import { ROUTES } from "@/lib/routes";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { dosesForDay, markDose } from "@/lib/adherence-store";
import { recordMood, toDateKey, MOOD_EMOJI, MOOD_LABEL, type MoodScore } from "@/lib/emotional-store";
import { APPOINTMENT_KIND_LABEL } from "@/lib/appointments-store";
import {
  MODULES,
  STAGES,
  STAGE_ORDER,
  isModuleActive,
  upcomingAppointments,
  type StageId,
} from "@/lib/journey";
import { MODULE_ICON } from "@/components/dashboard/DashboardNav";
import { cn } from "@/lib/utils";

interface Props {
  userName?: string | null;
  userId?: string | null;
}

export function InicioDashboard({ userName, userId }: Props) {
  const mounted = useIsClientMounted();
  const router = useRouter();
  const { journey, snapshot, refresh } = usePatientJourney(userId);
  const [now] = useState(() => new Date());

  // Un aliado que llega a `/dashboard` no debe encontrarse el panel del
  // paciente: cada rol tiene su propia entrada (ADR 0002).
  useEffect(() => {
    if (!mounted) return;
    const redirectByRole = () => {
      const { role } = getRole(userId);
      if (role === "medico") router.replace(ROUTES.alerts);
      if (role === "institucion") router.replace(ROUTES.institution);
    };
    redirectByRole();
    window.addEventListener(ROLE_UPDATED_EVENT, redirectByRole);
    return () => window.removeEventListener(ROLE_UPDATED_EVENT, redirectByRole);
  }, [mounted, userId, router]);

  const displayName =
    (mounted && getAccountData(userId ?? undefined)?.showName) || userName || "¿cómo vas?";

  const todayDoses = useMemo(
    () => (journey ? dosesForDay(snapshot.medications, snapshot.doseLog, now, now) : []),
    [journey, snapshot.medications, snapshot.doseLog, now]
  );

  const nextAppointment = useMemo(
    () => (journey ? upcomingAppointments(snapshot, now)[0] : undefined),
    [journey, snapshot, now]
  );

  const moodLoggedToday = snapshot.moods.some((entry) => entry.date === toDateKey(now));

  if (!mounted || !journey) {
    return <div className="h-64 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  const { stage, stageDef, pending, recoveryIndex, daysSinceDischarge } = journey;
  const currentIndex = STAGE_ORDER.indexOf(stage);
  const nextStage = STAGE_ORDER[currentIndex + 1];
  const isGraduated = stage === "alta_rehub";

  const pendingDoses = todayDoses.filter((dose) => dose.due && dose.mark === null);

  return (
    <div className="space-y-6">
      {/* Dónde estoy: etapa + carril + índice de recuperación */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-rehub-100 bg-gradient-to-br from-white via-rehub-50/60 to-rehub-100/40 p-6 shadow-card lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rehub-300/30 blur-3xl"
          />
          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-rehub-700/80">Hola, {displayName}</p>
                <h1 className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-balance text-2xl font-bold tracking-tightest text-rehub-950 lg:text-3xl">
                  {isGraduated ? (
                    <>
                      <PartyPopper className="h-7 w-7 text-rehub-600" />
                      Completaste tu recuperación
                    </>
                  ) : (
                    <>
                      <span className="text-rehub-500">Etapa {stageDef.step}</span>
                      {stageDef.label}
                    </>
                  )}
                </h1>
                <p className="mt-2 max-w-xl text-pretty text-base leading-relaxed text-rehub-900/70">
                  {stageDef.blurb}
                </p>
                {daysSinceDischarge !== null && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-rehub-800 ring-1 ring-rehub-100">
                    <Clock className="h-3.5 w-3.5 text-rehub-500" />
                    Día {daysSinceDischarge} desde tu alta médica
                  </p>
                )}
              </div>

              <div className="shrink-0 rounded-2xl border border-rehub-100 bg-white/85 p-4 shadow-soft backdrop-blur lg:min-w-[210px]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">
                  Índice de recuperación
                </p>
                {recoveryIndex === null ? (
                  <p className="mt-2 text-sm leading-snug text-rehub-900/60">
                    Todavía no hay nada que medir. Empieza y aparece solo.
                  </p>
                ) : (
                  <>
                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-3xl font-bold tabular-nums text-rehub-950">
                        {recoveryIndex}
                      </span>
                      <span className="pb-1 text-sm font-medium text-rehub-900/50">/ 100</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-rehub-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${recoveryIndex}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full bg-brand-gradient"
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-tight text-rehub-900/55">
                      Sale de tus dosis, tus terapias y tus trámites — no de un formulario.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* El recorrido completo, de un vistazo */}
            <div className="mt-7 flex items-center gap-1 overflow-x-auto pb-1">
              {STAGE_ORDER.map((stageId, index) => (
                <StageChip
                  key={stageId}
                  stageId={stageId}
                  index={index}
                  currentIndex={currentIndex}
                  isLast={index === STAGE_ORDER.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Lo de hoy */}
      {!isGraduated && (
        <Reveal delay={0.05}>
          <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
            <header className="flex items-baseline justify-between border-b border-rehub-100 px-6 py-4">
              <h2 className="text-lg font-semibold tracking-tight text-rehub-950">Lo de hoy</h2>
              <span className="text-xs font-medium text-rehub-900/50">
                {now.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </header>

            <div className="divide-y divide-rehub-100">
              {/* Dosis pendientes */}
              <div className="px-6 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-rehub-600" />
                  <h3 className="text-sm font-semibold text-rehub-900">Tus dosis</h3>
                </div>
                {todayDoses.length === 0 ? (
                  <EmptyLine
                    text="No tienes medicamentos cargados todavía."
                    href={ROUTES.medications}
                    cta="Agregar mi receta"
                  />
                ) : (
                  <ul className="space-y-1.5">
                    {todayDoses.map((dose) => (
                      <li
                        key={dose.key}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                          dose.mark === "taken"
                            ? "border-rehub-100 bg-rehub-50/60"
                            : dose.due
                              ? "border-amber-200 bg-amber-50/50"
                              : "border-rehub-100 bg-white"
                        )}
                      >
                        <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-rehub-900/70">
                          {dose.time}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-rehub-950">
                          {dose.medName}
                          {dose.dose && (
                            <span className="text-rehub-900/50"> · {dose.dose}</span>
                          )}
                        </span>
                        {dose.mark === "taken" ? (
                          <button
                            type="button"
                            onClick={() => {
                              markDose(dose.medId, now, dose.time, null, userId);
                              refresh();
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rehub-600 px-2.5 py-1 text-xs font-semibold text-white"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Tomada
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              markDose(dose.medId, now, dose.time, "taken", userId);
                              refresh();
                            }}
                            className="rounded-lg border border-rehub-200 px-2.5 py-1 text-xs font-semibold text-rehub-700 transition-colors hover:bg-rehub-50"
                          >
                            {dose.due ? "Marcar" : "Aún no toca"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {pendingDoses.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    {pendingDoses.length} dosis sin marcar hoy. Una dosis sin registrar cuenta como no
                    tomada.
                  </p>
                )}
              </div>

              {/* Próxima cita */}
              <div className="px-6 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-rehub-600" />
                  <h3 className="text-sm font-semibold text-rehub-900">Tu próxima cita</h3>
                </div>
                {nextAppointment ? (
                  <Link
                    href={ROUTES.appointments}
                    className="flex items-center gap-3 rounded-xl border border-rehub-100 bg-rehub-50/40 px-3 py-2.5 transition-colors hover:bg-rehub-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-rehub-950">
                        {nextAppointment.title}
                      </p>
                      <p className="truncate text-xs text-rehub-900/60">
                        {APPOINTMENT_KIND_LABEL[nextAppointment.kind]} · {nextAppointment.professional}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-xs font-semibold text-rehub-700">
                      {new Date(nextAppointment.datetime).toLocaleDateString("es-DO", {
                        day: "numeric",
                        month: "short",
                      })}
                      <span className="block font-normal text-rehub-900/55">
                        {new Date(nextAppointment.datetime).toLocaleTimeString("es-DO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <EmptyLine
                    text="No tienes ninguna cita agendada."
                    href={ROUTES.appointments}
                    cta="Agendar una cita"
                  />
                )}
              </div>

              {/* Ánimo de hoy */}
              {isModuleActive(MODULES.find((m) => m.id === "emocional")!, stage) && (
                <div className="px-6 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-rehub-600" />
                    <h3 className="text-sm font-semibold text-rehub-900">¿Cómo te sientes hoy?</h3>
                  </div>
                  {moodLoggedToday ? (
                    <p className="text-sm text-rehub-900/60">
                      Ya lo registraste hoy.{" "}
                      <Link href={ROUTES.emotional} className="font-semibold text-rehub-700 hover:underline">
                        Ver tu semana
                      </Link>
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => (
                        <button
                          key={score}
                          type="button"
                          title={MOOD_LABEL[score]}
                          onClick={() => {
                            recordMood(
                              {
                                id: `animo-${Date.now()}`,
                                date: toDateKey(now),
                                score,
                                tags: [],
                                createdAt: new Date().toISOString(),
                              },
                              userId
                            );
                            refresh();
                          }}
                          className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-rehub-100 py-2 transition-all hover:-translate-y-0.5 hover:border-rehub-300 hover:bg-rehub-50"
                        >
                          <span className="text-xl">{MOOD_EMOJI[score]}</span>
                          <span className="text-[10px] font-medium text-rehub-900/60">
                            {MOOD_LABEL[score]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </Reveal>
      )}

      {/* Qué falta para avanzar */}
      <Reveal delay={0.08}>
        <section
          className={cn(
            "overflow-hidden rounded-3xl border shadow-card",
            isGraduated ? "border-rehub-200 bg-gradient-to-br from-rehub-50 to-white" : "border-rehub-100 bg-white"
          )}
        >
          <header className="border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              {isGraduated ? (
                <>
                  <Flag className="h-5 w-5 text-rehub-600" />
                  Tu recorrido, completo
                </>
              ) : (
                <>Para pasar a {nextStage ? STAGES[nextStage].label : "la siguiente etapa"}</>
              )}
            </h2>
            {!isGraduated && (
              <p className="mt-0.5 text-sm text-rehub-900/60">
                {pending.length === 0
                  ? "Ya cumpliste todo lo de esta etapa."
                  : `Te ${pending.length === 1 ? "queda 1 cosa" : `quedan ${pending.length} cosas`} por hacer.`}
              </p>
            )}
          </header>

          <div className="p-6">
            {isGraduated ? (
              <p className="text-sm leading-relaxed text-rehub-900/75">
                Pasaste por las cuatro etapas: organizaste tu alta, sostuviste el tratamiento, mediste
                tu avance y volviste a tu vida. Tu información sigue disponible por si la necesitas.
              </p>
            ) : (
              <ul className="space-y-2">
                {pending.map((milestone) => (
                  <li key={milestone.id}>
                    <Link
                      href={milestone.href}
                      className="group flex items-center gap-3 rounded-2xl border border-rehub-100 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-soft"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-rehub-200" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-rehub-950">
                          {milestone.action}
                        </span>
                        <span className="block text-xs text-rehub-900/55">{milestone.label}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-rehub-400 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
                {journey.milestones
                  .filter((m) => m.stage === stage && m.done)
                  .map((milestone) => (
                    <li
                      key={milestone.id}
                      className="flex items-center gap-3 rounded-2xl px-4 py-2 opacity-60"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rehub-500 text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-sm text-rehub-900/70 line-through decoration-rehub-300">
                        {milestone.label}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      </Reveal>

      {/* Módulos activos en esta etapa */}
      <section>
        <Reveal>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-rehub-900/55">
            Lo que tienes activo ahora
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {MODULES.map((module) => {
            const active = isModuleActive(module, stage);
            const Icon = MODULE_ICON[module.id];
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow"
                      : "bg-rehub-50 text-rehub-300"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block font-semibold",
                      active ? "text-rehub-950 group-hover:text-rehub-700" : "text-rehub-900/40"
                    )}
                  >
                    {module.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs leading-relaxed",
                      active ? "text-rehub-900/60" : "text-rehub-900/35"
                    )}
                  >
                    {active
                      ? module.blurb
                      : `Se activa en ${STAGES[module.activatesAt].label}`}
                  </span>
                </span>
              </>
            );

            return (
              <StaggerItem key={module.id}>
                {active ? (
                  <Link
                    href={module.href}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col gap-3 rounded-2xl border border-dashed border-rehub-100 bg-rehub-50/30 p-4">
                    {content}
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Ayuda inmediata */}
      <Reveal delay={0.05}>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rehub-100 bg-white px-5 py-4 shadow-soft">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-rehub-900/70">
            <Phone className="h-4 w-4 text-rehub-600" />
            ¿Necesitas ayuda ahora?
          </span>
          <a href="tel:911" className="text-sm font-semibold text-red-600 hover:underline">
            911
          </a>
          <span className="text-rehub-300">·</span>
          <a href="tel:811" className="text-sm font-semibold text-rehub-700 hover:underline">
            811 salud mental
          </a>
          <span className="text-rehub-300">·</span>
          <a href="tel:8092001400" className="text-sm font-semibold text-rehub-700 hover:underline">
            809-200-1400
          </a>
        </div>
      </Reveal>
    </div>
  );
}

function StageChip({
  stageId,
  index,
  currentIndex,
  isLast,
}: {
  stageId: StageId;
  index: number;
  currentIndex: number;
  isLast: boolean;
}) {
  const stageDef = STAGES[stageId];
  const isDone = index < currentIndex;
  const isCurrent = index === currentIndex;

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
          isCurrent && "bg-rehub-600 text-white shadow-glow",
          isDone && "bg-white/80 text-rehub-700 ring-1 ring-rehub-200",
          !isDone && !isCurrent && "bg-white/40 text-rehub-900/40"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] tabular-nums",
            isCurrent && "bg-white/25",
            isDone && "bg-rehub-500 text-white",
            !isDone && !isCurrent && "bg-rehub-100/70"
          )}
        >
          {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : (stageDef.step ?? <Flag className="h-2.5 w-2.5" />)}
        </span>
        <span className="whitespace-nowrap">{stageDef.label}</span>
      </div>
      {!isLast && (
        <span
          aria-hidden
          className={cn("h-px w-3 shrink-0", isDone ? "bg-rehub-300" : "bg-rehub-200/60")}
        />
      )}
    </>
  );
}

function EmptyLine({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-rehub-900/60">
      {text}
      <Link href={href} className="font-semibold text-rehub-700 hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
