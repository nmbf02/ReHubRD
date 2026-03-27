"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconUser,
  IconClipboard,
  IconRefresh,
  IconBook,
} from "@/components/ui/Icons";
import { getPerfilInicial, calcularProgreso } from "@/lib/profile-store";
import { identificarNecesidades } from "@/lib/profile-needs";
import {
  obtenerRecomendaciones,
  RECOMENDACIONES_UNIVERSALES,
  RECORDATORIOS_SUGERIDOS,
  CHECKLIST_PRIORITARIO,
  type Recomendacion,
} from "@/lib/recommendation-plan";
import {
  identificarEscenarioDesdePerfil,
  type FlujoEscenario,
} from "@/lib/scenary-workflow";
import { NecesidadesSelector } from "./NeedsSelector";
import { FlujoPersonalizadoView } from "./CustomFlowView";

interface Props {
  userId?: string | null;
}

const ETIQUETA_CATEGORIA: Record<string, string> = {
  fisico: "Físico",
  emocional: "Emocional",
  laboral: "Laboral",
  logístico: "Trámites y logística",
  universal: "General",
};

function agruparPorPrioridad(recs: Recomendacion[]) {
  const alta: Recomendacion[] = [];
  const media: Recomendacion[] = [];
  const baja: Recomendacion[] = [];
  for (const r of recs) {
    const p = r.prioridad ?? "media";
    if (p === "alta") alta.push(r);
    else if (p === "media") media.push(r);
    else baja.push(r);
  }
  return { alta, media, baja };
}

export function PlanView({ userId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setProgreso(calcularProgreso(perfil));
  }, [mounted, userId ?? undefined]);

  if (!mounted) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const perfil = getPerfilInicial(userId ?? undefined);
  const necesidades = identificarNecesidades(perfil);
  const recomendacionesEspecificas = obtenerRecomendaciones(necesidades, perfil);
  const vistas = new Set<string>();
  const todasRecomendaciones = [
    ...RECOMENDACIONES_UNIVERSALES,
    ...recomendacionesEspecificas,
  ].filter((r) => {
    if (vistas.has(r.id)) return false;
    vistas.add(r.id);
    return true;
  });
  const { alta: recAlta, media: recMedia, baja: recBaja } =
    agruparPorPrioridad(todasRecomendaciones);

  const flujoPorSituacion: FlujoEscenario =
    identificarEscenarioDesdePerfil(perfil);

  if (progreso < 25) {
    return (
      <div className="space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            Completa tu perfil primero
          </h2>
          <p className="text-amber-800/90 text-sm mb-6 max-w-lg mx-auto">
            Para generar tu plan personalizado necesitamos más información sobre
            tu situación. Completa al menos el 25% de tu perfil de recuperación.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
          >
            <IconUser className="w-5 h-5" />
            Ir a Mi perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Flujo de recuperación */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider">
            Tu flujo de recuperación
          </h2>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconUser className="w-4 h-4" />
              1. Mi perfil
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/15 text-rehub-primary border border-rehub-primary/30 text-sm font-medium">
              <IconClipboard className="w-4 h-4" />
              2. Mi plan
            </span>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href="/dashboard/followup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconRefresh className="w-4 h-4" />
              3. Seguimiento
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconBook className="w-4 h-4" />
              4. Recursos
            </Link>
          </div>
        </div>
      </section>

      {/* Tu flujo según tu situación */}
      <section
        className={`rounded-2xl border overflow-hidden ${
          flujoPorSituacion.prioridad === "urgente"
            ? "bg-red-50/80 border-red-200"
            : "bg-white border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flujoPorSituacion.emoji}</span>
            <div>
              <h2 className="text-lg font-semibold text-rehub-dark">
                Guía: {flujoPorSituacion.nombre}
              </h2>
              <p className="text-sm text-rehub-dark/70 mt-0.5">
                {flujoPorSituacion.descripcion}
              </p>
              <p className="text-xs text-rehub-dark/60 mt-1">
                Seguimiento: {flujoPorSituacion.frecuenciaSeguimiento}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {flujoPorSituacion.pasos.slice(0, 3).map((paso) => (
              <Link
                key={paso.orden}
                href={paso.href ?? "/dashboard/resources"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/10 text-rehub-primary hover:bg-rehub-primary/20 text-sm font-medium transition-colors"
              >
                {paso.orden}. {paso.titulo}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/followup"
            className="inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline"
          >
            Actualizar seguimiento para plan detallado
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Selecciona tus necesidades */}
      <NecesidadesSelector userId={userId} />

      {/* Flujo personalizado (según selección) */}
      <FlujoPersonalizadoView userId={userId} />

      {/* Resumen ejecutivo */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Tu plan personalizado
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            {necesidades.length} áreas prioritarias · {todasRecomendaciones.length} recomendaciones. En Recursos: guías para transporte, medicamentos, apoyo cuando estás sola o solo.
          </p>
        </div>
        <div className="p-6 lg:p-8">
          {/* Necesidades prioritarias */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider mb-4">
              Necesidades identificadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {necesidades.map((n) => (
                <span
                  key={n.id}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    n.prioridad === "alta"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : n.prioridad === "media"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {n.titulo}
                </span>
              ))}
            </div>
          </div>

          {/* Checklist de acciones prioritarias */}
          <div>
            <h3 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider mb-4">
              Acciones prioritarias
            </h3>
            <ul className="space-y-3">
              {CHECKLIST_PRIORITARIO.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-rehub-primary/30 hover:bg-rehub-primary/5 transition-colors group"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-300 text-slate-500 shrink-0 group-hover:border-rehub-primary group-hover:text-rehub-primary" />
                    <span className="font-medium text-rehub-dark">
                      {item.texto}
                    </span>
                    <span className="ml-auto text-sm text-rehub-primary opacity-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recomendaciones: alta prioridad */}
      {recAlta.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-rehub-dark">
              Recomendaciones prioritarias
            </h2>
            <p className="mt-1 text-sm text-rehub-dark/60">
              Acciones que tienen mayor impacto en tu recuperación
            </p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              {recAlta.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {r.categoria && (
                        <span className="text-xs font-medium text-rehub-dark/60 uppercase">
                          {ETIQUETA_CATEGORIA[r.categoria] ?? r.categoria}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-rehub-dark">{r.titulo}</h4>
                    <p className="text-sm text-rehub-dark/70 mt-1">
                      {r.descripcion}
                    </p>
                  </div>
                  <Link
                    href={r.href ?? "/dashboard/resources"}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rehub-primary border border-rehub-primary/30 rounded-lg hover:bg-rehub-primary/5 transition-colors"
                  >
                    {r.accion ?? "Ver más"}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recomendaciones: media y resto */}
      {(recMedia.length > 0 || recBaja.length > 0) && (
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-rehub-dark">
              Más recomendaciones
            </h2>
            <p className="mt-1 text-sm text-rehub-dark/60">
              Orientación adicional para tu proceso
            </p>
          </div>
          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              {[...recMedia, ...recBaja].map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {r.categoria && (
                      <span className="text-xs font-medium text-rehub-dark/60 uppercase">
                        {ETIQUETA_CATEGORIA[r.categoria] ?? r.categoria}
                      </span>
                    )}
                    <h4 className="font-medium text-rehub-dark mt-0.5">
                      {r.titulo}
                    </h4>
                    <p className="text-sm text-rehub-dark/70 mt-1">
                      {r.descripcion}
                    </p>
                  </div>
                  <Link
                    href={r.href ?? "/dashboard/resources"}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rehub-primary border border-rehub-primary/30 rounded-lg hover:bg-rehub-primary/5 transition-colors"
                  >
                    {r.accion ?? "Ver más"}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trámites República Dominicana */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Trámites en República Dominicana
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Información útil: ARS, SISALRIL, incapacidad laboral
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-semibold text-rehub-dark mb-2">
                ARS y SISALRIL
              </h4>
              <p className="text-rehub-dark/70">
                Para verificar tu afiliación a una ARS y trámites de salud:
                <strong> virtual.sisalril.gob.do</strong>. El subsidio por
                incapacidad (enfermedad común o accidente no laboral) requiere
                licencia médica registrada por tu empleador.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-semibold text-rehub-dark mb-2">
                Accidentes laborales (IDOPPRIL)
              </h4>
              <p className="text-rehub-dark/70">
                Si fue accidente de trabajo, el IDOPPRIL gestiona indemnización
                cuando hay pérdida de capacidad laboral entre 15% y 50%.
                Consulta idoppril.gob.do.
              </p>
            </div>
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline"
            >
              Ver guía completa de trámites
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recordatorios */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Recordatorios sugeridos
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Acciones periódicas para mantener tu recuperación al día
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RECORDATORIOS_SUGERIDOS.map((rem) => (
              <Link
                key={rem.id}
                href={rem.href}
                className="group flex flex-col p-5 rounded-xl border border-slate-200/80 hover:border-rehub-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <IconRefresh className="w-8 h-8 text-rehub-primary/60" />
                  {"frecuencia" in rem && (
                    <span className="text-xs font-medium text-rehub-dark/60 uppercase">
                      {(rem as { frecuencia?: string }).frecuencia}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  {rem.titulo}
                </h4>
                <p className="text-sm text-rehub-dark/60 mt-1 flex-1">
                  {rem.descripcion}
                </p>
                <span className="mt-3 text-sm font-medium text-rehub-primary">
                  Ir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ayuda gratuita y Planes de acogida */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Ayuda gratuita y Planes de acogida
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Servicios sin costo y programas de acompañamiento en República Dominicana
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/resources#ayuda-gratuita"
              className="flex items-start gap-4 p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-rehub-primary/40 transition-all group"
            >
              <span className="text-2xl">🎁</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  Ayuda gratuita
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  Líneas de salud mental (811, 809-200-1400), medicamentos Promese/CAL, hospitales públicos, ADR, programas sociales.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">Ver recursos →</span>
              </div>
            </Link>
            <Link
              href="/dashboard/resources#planes-acogida"
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rehub-primary/5 hover:border-rehub-primary/30 transition-all group"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  Planes de acogida
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  Asociación Dominicana de Rehabilitación (35 centros), seguimiento post-alta, grupos de apoyo, reinserción laboral.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">Ver recursos →</span>
              </div>
            </Link>
            <Link
              href="/dashboard/resources#sitios-cercanos"
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rehub-primary/5 hover:border-rehub-primary/30 transition-all group"
            >
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  Sitios cercanos
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  Hospitales, centros ADR y recursos en tu provincia. Completa tu ubicación en Mi perfil para ver los de tu zona.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">Ver sitios cercanos →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos pasos */}
      <section className="bg-gradient-to-r from-rehub-primary/5 to-rehub-accent/5 rounded-2xl border border-rehub-primary/20 p-6 lg:p-8">
        <h3 className="font-semibold text-rehub-dark mb-4">Próximos pasos</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Link
            href="/dashboard/followup"
            className="inline-flex items-center gap-2 px-5 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
          >
            <IconRefresh className="w-5 h-5" />
            Actualizar seguimiento
          </Link>
          <Link
            href="/dashboard/resources"
            className="inline-flex items-center gap-2 px-5 py-3 border border-rehub-primary/30 text-rehub-primary rounded-xl font-medium hover:bg-rehub-primary/5 transition-colors"
          >
            <IconBook className="w-5 h-5" />
            Ver recursos
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 text-rehub-dark rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <IconUser className="w-5 h-5" />
            Revisar perfil
          </Link>
        </div>
      </section>
    </div>
  );
}
