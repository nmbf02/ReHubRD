"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
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
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { useScenarioCopy } from "@/hooks/use-scenario-copy";

interface Props {
  userId?: string | null;
}

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

const CATEGORY_I18N: Record<string, "categoryFisico" | "categoryEmocional" | "categoryLaboral" | "categoryLogistico" | "categoryUniversal"> = {
  fisico: "categoryFisico",
  emocional: "categoryEmocional",
  laboral: "categoryLaboral",
  logístico: "categoryLogistico",
  universal: "categoryUniversal",
};

export function PlanView({ userId }: Props) {
  const mounted = useIsClientMounted();
  const [progreso, setProgreso] = useState(0);
  const tp = useTranslations("dashboard.planPage");
  const tNav = useTranslations("dashboard.nav");
  const tFlow = useTranslations("dashboard.inicio");
  const sc = useScenarioCopy();

  function categoryLabel(categoria: string | undefined): string {
    if (!categoria) return "";
    const key = CATEGORY_I18N[categoria];
    return key ? tp(key) : categoria;
  }

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setProgreso(calcularProgreso(perfil));
  }, [mounted, userId]);

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
            {tp("incompleteTitle")}
          </h2>
          <p className="text-amber-800/90 text-sm mb-6 max-w-lg mx-auto">
            {tp("incompleteBody")}
          </p>
          <Link
            href={ROUTES.profile}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
          >
            <IconUser className="w-5 h-5" />
            {tp("goProfile")}
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
            {tFlow("flowTitle")}
          </h2>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href={ROUTES.profile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconUser className="w-4 h-4" />
              1. {tNav("profile")}
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/15 text-rehub-primary border border-rehub-primary/30 text-sm font-medium">
              <IconClipboard className="w-4 h-4" />
              2. {tNav("plan")}
            </span>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href={ROUTES.followup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconRefresh className="w-4 h-4" />
              3. {tNav("followup")}
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href={ROUTES.resources}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconBook className="w-4 h-4" />
              4. {tNav("resources")}
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
                {tp("guideHeading")} {sc.nombre(flujoPorSituacion.id)}
              </h2>
              <p className="text-sm text-rehub-dark/70 mt-0.5">
                {sc.descripcion(flujoPorSituacion.id)}
              </p>
              <p className="text-xs text-rehub-dark/60 mt-1">
                {tp("followupFreq", {
                  freq: sc.frecuenciaSeguimiento(flujoPorSituacion.id),
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {flujoPorSituacion.pasos.slice(0, 3).map((paso, i) => (
              <Link
                key={paso.orden}
                href={paso.href ?? ROUTES.resources}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/10 text-rehub-primary hover:bg-rehub-primary/20 text-sm font-medium transition-colors"
              >
                {paso.orden}. {sc.pasoTitulo(flujoPorSituacion.id, i)}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
          <Link
            href={ROUTES.followup}
            className="inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline"
          >
            {tp("updateFollowupDetail")}
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
            {tp("personalizedTitle")}
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            {tp("personalizedSummary", {
              areasCount: necesidades.length,
              recsCount: todasRecomendaciones.length,
            })}
          </p>
        </div>
        <div className="p-6 lg:p-8">
          {/* Necesidades prioritarias */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider mb-4">
              {tp("identifiedNeeds")}
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
              {tp("priorityActions")}
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
              {tp("recsHighTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-dark/60">
              {tp("recsHighSubtitle")}
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
                          {categoryLabel(r.categoria)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-rehub-dark">{r.titulo}</h4>
                    <p className="text-sm text-rehub-dark/70 mt-1">
                      {r.descripcion}
                    </p>
                  </div>
                  <Link
                    href={r.href ?? ROUTES.resources}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rehub-primary border border-rehub-primary/30 rounded-lg hover:bg-rehub-primary/5 transition-colors"
                  >
                    {r.accion ?? tp("seeMore")}
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
              {tp("recsMoreTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-dark/60">
              {tp("recsMoreSubtitle")}
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
                        {categoryLabel(r.categoria)}
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
                    href={r.href ?? ROUTES.resources}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rehub-primary border border-rehub-primary/30 rounded-lg hover:bg-rehub-primary/5 transition-colors"
                  >
                    {r.accion ?? tp("seeMore")}
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
            {tp("proceduresTitle")}
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            {tp("proceduresSubtitle")}
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="space-y-5 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-semibold text-rehub-dark mb-2">
                {tp("proceduresArsTitle")}
              </h4>
              <p className="text-rehub-dark/70">
                {tp("proceduresArsBody")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-semibold text-rehub-dark mb-2">
                {tp("proceduresIdopprilTitle")}
              </h4>
              <p className="text-rehub-dark/70">
                {tp("proceduresIdopprilBody")}
              </p>
            </div>
            <Link
              href={ROUTES.resources}
              className="inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline"
            >
              {tp("proceduresGuideLink")}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recordatorios */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            {tp("remindersTitle")}
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            {tp("remindersSubtitle")}
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
                  {tp("reminderGo")}
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
            {tp("helpSectionTitle")}
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            {tp("helpSectionSubtitle")}
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href={hrefResourcesHash("ayuda-gratuita")}
              className="flex items-start gap-4 p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-rehub-primary/40 transition-all group"
            >
              <span className="text-2xl">🎁</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  {tFlow("freeHelpTitle")}
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  {tp("freeHelpCardBody")}
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">{tp("viewResourcesArrow")}</span>
              </div>
            </Link>
            <Link
              href={hrefResourcesHash("planes-acogida")}
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rehub-primary/5 hover:border-rehub-primary/30 transition-all group"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  {tFlow("shelterTitle")}
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  {tp("shelterCardBody")}
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">{tp("viewResourcesArrow")}</span>
              </div>
            </Link>
            <Link
              href={hrefResourcesHash("sitios-cercanos")}
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rehub-primary/5 hover:border-rehub-primary/30 transition-all group"
            >
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  {tp("nearbyCardTitle")}
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  {tp("nearbyCardBody")}
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">{tp("nearbyCardLink")}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos pasos */}
      <section className="bg-gradient-to-r from-rehub-primary/5 to-rehub-accent/5 rounded-2xl border border-rehub-primary/20 p-6 lg:p-8">
        <h3 className="font-semibold text-rehub-dark mb-4">{tp("nextStepsTitle")}</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Link
            href={ROUTES.followup}
            className="inline-flex items-center gap-2 px-5 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
          >
            <IconRefresh className="w-5 h-5" />
            {tp("updateFollowup")}
          </Link>
          <Link
            href={ROUTES.resources}
            className="inline-flex items-center gap-2 px-5 py-3 border border-rehub-primary/30 text-rehub-primary rounded-xl font-medium hover:bg-rehub-primary/5 transition-colors"
          >
            <IconBook className="w-5 h-5" />
            {tNav("resources")}
          </Link>
          <Link
            href={ROUTES.profile}
            className="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 text-rehub-dark rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <IconUser className="w-5 h-5" />
            {tp("reviewProfile")}
          </Link>
        </div>
      </section>
    </div>
  );
}
