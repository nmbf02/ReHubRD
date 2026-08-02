"use client";

/** Piezas compartidas por los paneles del médico y de la institución. */

import { STAGES, type JourneyState, type StageId } from "@/lib/journey";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, compact }: { stage: StageId; compact?: boolean }) {
  const stageDef = STAGES[stage];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        stage === "alta_rehub"
          ? "bg-rehub-600 text-white"
          : stage === "ingreso"
            ? "bg-sky-50 text-sky-700"
            : stage === "tratamiento"
              ? "bg-rehub-50 text-rehub-700"
              : stage === "avance"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-violet-50 text-violet-700"
      )}
    >
      {stageDef.step !== null && <span className="tabular-nums opacity-60">{stageDef.step}</span>}
      {!compact && stageDef.label}
    </span>
  );
}

/** Nivel de riesgo derivado de las alertas — no es un dato aparte. */
export function riskOf(journey: JourneyState): "alto" | "medio" | "ninguno" {
  if (journey.alerts.some((alert) => alert.severity === "alta")) return "alto";
  if (journey.alerts.length > 0) return "medio";
  return "ninguno";
}

export function RiskDot({ journey }: { journey: JourneyState }) {
  const risk = riskOf(journey);
  return (
    <span
      title={
        risk === "alto" ? "Riesgo alto" : risk === "medio" ? "Atención" : "Sin alertas"
      }
      className={cn(
        "h-2.5 w-2.5 shrink-0 rounded-full",
        risk === "alto" ? "bg-red-500" : risk === "medio" ? "bg-amber-400" : "bg-rehub-300"
      )}
    />
  );
}

/** Barra compacta para una señal 0–100 en una fila de tabla. */
export function MiniBar({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-rehub-900/30">—</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-rehub-100">
        <span
          className={cn(
            "block h-full rounded-full",
            value >= 70 ? "bg-rehub-500" : value >= 50 ? "bg-amber-400" : "bg-red-400"
          )}
          style={{ width: `${value}%` }}
        />
      </span>
      <span
        className={cn(
          "w-9 text-right text-xs font-semibold tabular-nums",
          value >= 70 ? "text-rehub-900" : value >= 50 ? "text-amber-700" : "text-red-600"
        )}
      >
        {value}%
      </span>
    </span>
  );
}

/** Tarjeta de indicador para las cabeceras de panel. */
export function MetricCard({
  label,
  value,
  help,
  tone = "neutral",
}: {
  label: string;
  value: string;
  help?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-soft",
        tone === "bad" ? "border-red-200" : tone === "warn" ? "border-amber-200" : "border-rehub-100"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-rehub-900/50">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "bad" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-rehub-950"
        )}
      >
        {value}
      </p>
      {help && <p className="mt-1 text-xs leading-relaxed text-rehub-900/55">{help}</p>}
    </div>
  );
}
