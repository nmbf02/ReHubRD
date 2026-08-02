"use client";

/**
 * Módulo 6 — Reintegración laboral y social. Es el final del recorrido (BR-02):
 * la tesis define el alcance del producto «desde el alta médica hasta su
 * reintegración laboral y social» (tesis.txt:352).
 *
 * Tres carriles en paralelo, no una escalera: alguien puede recuperar su vida
 * social mucho antes de volver al trabajo, y al revés.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Check, Clock, Minus, Flag, PartyPopper } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  type MilestoneStatus,
  type MilestoneTrack,
  type ReintegrationState,
  MILESTONE_STATUS_LABEL,
  REINTEGRATION_MILESTONES,
  REINTEGRATION_UPDATED_EVENT,
  TRACK_LABEL,
  getReintegration,
  reintegrationScore,
  setMilestoneStatus,
} from "@/lib/reintegration-store";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

const STATUS_CYCLE: MilestoneStatus[] = ["pendiente", "en_proceso", "logrado", "no_aplica"];

const TRACK_ORDER: MilestoneTrack[] = ["laboral", "autonomia", "social"];

const TRACK_BLURB: Record<MilestoneTrack, string> = {
  laboral: "Lo que hace falta para reincorporarte sin recaer.",
  autonomia: "Recuperar lo que hacías sin pensarlo.",
  social: "Que el accidente deje de ser el tema.",
};

export function ReintegrationView({ userId }: Props) {
  const [state, setState] = useState<ReintegrationState>({
    status: {},
    achievedAt: {},
    updatedAt: "",
  });
  const [mounted, setMounted] = useState(false);

  const reload = useCallback(() => {
    setState(getReintegration(userId));
    setMounted(true);
  }, [userId]);

  useEffect(() => {
    reload();
    window.addEventListener(REINTEGRATION_UPDATED_EVENT, reload);
    return () => window.removeEventListener(REINTEGRATION_UPDATED_EVENT, reload);
  }, [reload]);

  const score = useMemo(() => reintegrationScore(state), [state]);
  const achieved = REINTEGRATION_MILESTONES.filter(
    (milestone) => state.status[milestone.id] === "logrado"
  ).length;
  const relevant = REINTEGRATION_MILESTONES.filter(
    (milestone) => (state.status[milestone.id] ?? "pendiente") !== "no_aplica"
  ).length;
  const allDone = relevant > 0 && achieved === relevant;

  const cycle = (id: string) => {
    const current = state.status[id] ?? "pendiente";
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    setState(setMilestoneStatus(id, next, userId));
  };

  if (!mounted) {
    return <div className="h-56 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  return (
    <div className="space-y-6">
      <Reveal>
        <section
          className={cn(
            "rounded-3xl border p-6 shadow-card lg:p-8",
            allDone
              ? "border-rehub-200 bg-gradient-to-br from-rehub-100/70 to-white"
              : "border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50"
          )}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
                {allDone ? (
                  <PartyPopper className="h-5 w-5 text-rehub-600" />
                ) : (
                  <Briefcase className="h-5 w-5 text-rehub-600" />
                )}
                {allDone ? "Volviste a tu vida" : "Volver a tu vida"}
              </h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-rehub-900/65">
                {allDone
                  ? "Cerraste los tres carriles. Este es el final del recorrido en ReHub."
                  : "Esta es la última etapa. Marca cada cosa a medida que la vayas logrando — no hay orden obligatorio."}
              </p>
            </div>
            {score !== null && (
              <p className="text-4xl font-bold tabular-nums leading-none text-rehub-950">
                {score}
                <span className="text-base font-medium text-rehub-900/40">%</span>
              </p>
            )}
          </div>
        </section>
      </Reveal>

      {TRACK_ORDER.map((track, index) => {
        const milestones = REINTEGRATION_MILESTONES.filter((m) => m.track === track);
        const trackDone = milestones.filter((m) => state.status[m.id] === "logrado").length;

        return (
          <Reveal key={track} delay={0.05 + index * 0.03}>
            <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
              <header className="flex items-baseline justify-between gap-2 border-b border-rehub-100 px-6 py-4">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-rehub-950">
                    {TRACK_LABEL[track]}
                  </h3>
                  <p className="mt-0.5 text-sm text-rehub-900/60">{TRACK_BLURB[track]}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-rehub-900/50">
                  {trackDone}/{milestones.length}
                </span>
              </header>

              <ul className="divide-y divide-rehub-100">
                {milestones.map((milestone) => {
                  const status = state.status[milestone.id] ?? "pendiente";
                  const achievedOn = state.achievedAt[milestone.id];

                  return (
                    <li key={milestone.id} className="flex items-start gap-3 px-6 py-3.5">
                      <button
                        type="button"
                        onClick={() => cycle(milestone.id)}
                        title={`${MILESTONE_STATUS_LABEL[status]} — toca para cambiar`}
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-105",
                          status === "logrado" && "border-rehub-500 bg-rehub-500 text-white",
                          status === "en_proceso" && "border-amber-300 bg-amber-50 text-amber-700",
                          status === "no_aplica" && "border-rehub-100 bg-rehub-50 text-rehub-900/35",
                          status === "pendiente" && "border-rehub-200 bg-white"
                        )}
                      >
                        {status === "logrado" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        {status === "en_proceso" && <Clock className="h-3.5 w-3.5" />}
                        {status === "no_aplica" && <Minus className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            status === "logrado"
                              ? "text-rehub-900/50"
                              : status === "no_aplica"
                                ? "text-rehub-900/40"
                                : "text-rehub-950"
                          )}
                        >
                          {milestone.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-rehub-900/60">
                          {milestone.help}
                        </p>
                        {achievedOn && (
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-rehub-700">
                            <Flag className="h-3 w-3" />
                            Logrado el{" "}
                            {new Date(achievedOn).toLocaleDateString("es-DO", {
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                        )}
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
