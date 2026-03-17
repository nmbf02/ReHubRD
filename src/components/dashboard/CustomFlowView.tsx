"use client";

import { useState, useEffect } from "react";
import {
  getNecesidadesSeleccionadas,
  buildGuiasParaFlujo,
  type GuiaInline,
} from "@/lib/needs-options";
import { GUIAS_APOYO } from "@/lib/resources-guide";

interface Props {
  userId?: string | null;
}

function BloqueGuia({ guia }: { guia: GuiaInline }) {
  return (
    <div className="p-5 rounded-xl border border-rehub-primary/20 bg-white">
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-rehub-primary/20 text-rehub-primary font-bold text-sm">
          {guia.orden}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-rehub-dark flex items-center gap-2">
            <span>{guia.emoji}</span>
            {guia.titulo}
          </h3>
          <p className="text-sm text-rehub-dark/70 mt-1">{guia.descripcion}</p>
        </div>
      </div>

      {guia.pasos.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-rehub-dark/80 mb-2">
            Pasos y opciones
          </h4>
          <ol className="space-y-2">
            {guia.pasos.map((paso, i) => (
              <li
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-rehub-primary/20 text-rehub-primary font-semibold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-rehub-dark/90">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {guia.contactos && guia.contactos.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-rehub-dark/80 mb-2">
            Contactos útiles
          </h4>
          <div className="flex flex-wrap gap-2">
            {guia.contactos.map((c) => {
              const href =
                c.tipo === "tel"
                  ? `tel:${c.valor.replace(/\D/g, "")}`
                  : c.tipo === "web"
                    ? (c.valor.startsWith("http") ? c.valor : `https://${c.valor}`)
                    : null;
              const clase =
                "inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary/10 text-rehub-primary rounded-lg text-sm font-medium hover:bg-rehub-primary/20 transition-colors";
              return href ? (
                <a key={c.nombre} href={href} target={c.tipo === "web" ? "_blank" : undefined} rel={c.tipo === "web" ? "noopener noreferrer" : undefined} className={clase}>
                  {c.tipo === "tel" ? "📞" : "🌐"} {c.nombre}: {c.valor}
                </a>
              ) : (
                <span key={c.nombre} className={clase}>{c.nombre}: {c.valor}</span>
              );
            })}
          </div>
        </div>
      )}

      {guia.nota && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>Nota:</strong> {guia.nota}
          </p>
        </div>
      )}
    </div>
  );
}

export function FlujoPersonalizadoView({ userId }: Props) {
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

  const guiasMap: Record<string, { descripcion: string; pasos?: string[]; contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[]; nota?: string }> = {};
  for (const [id, g] of Object.entries(GUIAS_APOYO)) {
    guiasMap[id] = {
      descripcion: g.descripcion,
      pasos: g.pasos,
      contactos: g.contactos,
      nota: g.nota,
    };
  }

  const guias = buildGuiasParaFlujo(seleccionados, guiasMap);

  if (!mounted || guias.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-rehub-primary/5 to-rehub-accent/5 rounded-2xl border border-rehub-primary/20 overflow-hidden">
      <div className="px-6 lg:px-8 py-6 border-b border-rehub-primary/20">
        <h2 className="text-lg font-semibold text-rehub-dark">
          Tu guía personalizada
        </h2>
        <p className="mt-1 text-sm text-rehub-dark/60">
          Todo el contenido aquí, según lo que seleccionaste. No necesitas ir a otra página.
        </p>
      </div>
      <div className="p-6 lg:p-8 space-y-6">
        {guias.map((guia) => (
          <BloqueGuia key={guia.orden} guia={guia} />
        ))}
      </div>
    </section>
  );
}
