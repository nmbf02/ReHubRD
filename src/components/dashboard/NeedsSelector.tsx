"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  OPCIONES_NECESIDADES,
  getNecesidadesSeleccionadas,
  saveNecesidadesSeleccionadas,
} from "@/lib/needs-options";

interface Props {
  userId?: string | null;
}

export function NecesidadesSelector({ userId }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
  }, [mounted, userId ?? undefined]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () =>
      setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
    window.addEventListener("rehub-necesidades-updated", handler);
    return () => window.removeEventListener("rehub-necesidades-updated", handler);
  }, [mounted, userId ?? undefined]);

  function toggle(id: string) {
    const next = seleccionados.includes(id)
      ? seleccionados.filter((x) => x !== id)
      : [...seleccionados, id];
    setSeleccionados(next);
    saveNecesidadesSeleccionadas(next, userId ?? undefined);
  }

  if (!mounted) return null;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-rehub-dark">
          Selecciona tus necesidades
        </h2>
        <p className="mt-1 text-sm text-rehub-dark/60">
          Marca las que aplican. Verás la guía completa con todos los pasos aquí abajo, sin salir de la página.
        </p>
      </div>
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OPCIONES_NECESIDADES.map((op) => {
            const isSelected = seleccionados.includes(op.id);
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => toggle(op.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-rehub-primary bg-rehub-primary/10"
                    : "border-slate-200 hover:border-rehub-primary/30 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "border-rehub-primary bg-rehub-primary text-white"
                      : "border-slate-300"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span className="text-xl">{op.emoji}</span>
                <span className="text-sm font-medium text-rehub-dark truncate">
                  {op.titulo}
                </span>
              </button>
            );
          })}
        </div>
        {seleccionados.length > 0 && (
          <p className="mt-4 text-sm text-rehub-dark/60">
            {seleccionados.length} seleccionadas. Ver tu guía personalizada abajo.
          </p>
        )}
      </div>
    </section>
  );
}
