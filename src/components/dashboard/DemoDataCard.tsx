"use client";

/**
 * Control de la demostración. Explícito y accionado por la persona: sembrar
 * datos por nuestra cuenta en el almacenamiento de alguien sería escribirle
 * información clínica que no es suya.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, RotateCcw, Check } from "lucide-react";
import { clearPatientData, seedDemoPatient } from "@/lib/demo-seed";
import { ROUTES } from "@/lib/routes";

interface Props {
  userId: string | null;
}

export function DemoDataCard({ userId }: Props) {
  const router = useRouter();
  const [done, setDone] = useState<"seed" | "clear" | null>(null);

  const run = (action: "seed" | "clear") => {
    if (action === "seed") seedDemoPatient(userId);
    else clearPatientData(userId);
    setDone(action);
    router.refresh();
  };

  return (
    <section className="mt-6 rounded-xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
          <FlaskConical className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-rehub-950">
            Modo demostración
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-rehub-900/65">
            Carga un caso de ejemplo a mitad de recuperación: 47 días desde el alta, tratamiento en
            curso, siete terapias completadas y la reclamación de la ARS avanzando. Sirve para ver el
            recorrido completo sin tener que registrar semanas de datos. Queda en la etapa de Avance,
            a una sola terapia de pasar a Reintegración.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => run("seed")}
              className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-rehub-700"
            >
              {done === "seed" ? <Check className="h-4 w-4" /> : <FlaskConical className="h-4 w-4" />}
              {done === "seed" ? "Caso cargado" : "Cargar caso de ejemplo"}
            </button>
            <button
              type="button"
              onClick={() => run("clear")}
              className="inline-flex items-center gap-2 rounded-xl border border-rehub-200 px-4 py-2.5 text-sm font-semibold text-rehub-700 transition-colors hover:bg-rehub-50"
            >
              <RotateCcw className="h-4 w-4" />
              Empezar de cero
            </button>
          </div>

          {done && (
            <p className="mt-3 text-sm font-medium text-rehub-700">
              Listo.{" "}
              <a href={ROUTES.dashboard} className="underline">
                Ir a tu recorrido
              </a>
              {done === "seed" && " — quedas en la etapa de Avance, a una terapia de la última etapa."}
            </p>
          )}

          <p className="mt-4 border-t border-rehub-100 pt-3 text-xs leading-relaxed text-rehub-900/50">
            Todo se guarda solo en este dispositivo. Ningún dato clínico sale del navegador.
          </p>
        </div>
      </div>
    </section>
  );
}
