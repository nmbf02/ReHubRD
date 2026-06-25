"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import Link from "next/link";
import {
  User,
  ClipboardList,
  RefreshCw,
  BookOpen,
  Gift,
  Home,
  MapPin,
  ChevronRight,
  AlertCircle,
  Circle,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
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
import { NeedsSelector } from "./NeedsSelector";
import { FlujoPersonalizadoView } from "./CustomFlowView";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { useScenarioCopy } from "@/hooks/use-scenario-copy";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

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
        <Reveal>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/60 p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              {tp("incompleteTitle")}
            </h2>
            <p className="text-amber-800/90 text-sm mb-6 max-w-lg mx-auto text-pretty">
              {tp("incompleteBody")}
            </p>
            <Link
              href={ROUTES.profile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
            >
              <User className="w-4 h-4" />
              {tp("goProfile")}
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flujo de recuperación */}
      <Reveal>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-4 border-b border-rehub-100">
            <h2 className="text-xs font-semibold text-rehub-900/55 uppercase tracking-wider">
              {tFlow("flowTitle")}
            </h2>
          </div>
          <div className="px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={ROUTES.profile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 hover:bg-rehub-100 hover:text-rehub-700 transition-all text-sm font-medium border border-rehub-100"
              >
                <User className="w-4 h-4" />
                1. {tNav("profile")}
              </Link>
              <ChevronRight className="w-4 h-4 text-rehub-200 hidden sm:block shrink-0" />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-600 text-white border border-rehub-600 text-sm font-semibold shadow-glow">
                <ClipboardList className="w-4 h-4" />
                2. {tNav("plan")}
              </span>
              <ChevronRight className="w-4 h-4 text-rehub-200 hidden sm:block shrink-0" />
              <Link
                href={ROUTES.followup}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 hover:bg-rehub-100 hover:text-rehub-700 transition-all text-sm font-medium border border-rehub-100"
              >
                <RefreshCw className="w-4 h-4" />
                3. {tNav("followup")}
              </Link>
              <ChevronRight className="w-4 h-4 text-rehub-200 hidden sm:block shrink-0" />
              <Link
                href={ROUTES.resources}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 hover:bg-rehub-100 hover:text-rehub-700 transition-all text-sm font-medium border border-rehub-100"
              >
                <BookOpen className="w-4 h-4" />
                4. {tNav("resources")}
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Tu flujo según tu situación */}
      <Reveal delay={0.05}>
        <section
          className={`rounded-2xl border overflow-hidden shadow-card ${
            flujoPorSituacion.prioridad === "urgente"
              ? "bg-gradient-to-br from-red-50 to-red-50/60 border-red-200"
              : "bg-white border-rehub-100"
          }`}
        >
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100/60">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {tp("guideHeading")} {sc.nombre(flujoPorSituacion.id)}
                </h2>
                <p className="text-sm text-rehub-900/65 mt-0.5 text-pretty">
                  {sc.descripcion(flujoPorSituacion.id)}
                </p>
                <p className="text-xs text-rehub-900/50 mt-1">
                  {tp("followupFreq", {
                    freq: sc.frecuenciaSeguimiento(flujoPorSituacion.id),
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 lg:px-8 py-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {flujoPorSituacion.pasos.slice(0, 3).map((paso, i) => (
                <Link
                  key={paso.orden}
                  href={paso.href ?? ROUTES.resources}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-700 border border-rehub-200 hover:bg-rehub-100 hover:border-rehub-300 text-sm font-medium transition-all"
                >
                  {paso.orden}. {sc.pasoTitulo(flujoPorSituacion.id, i)}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
            <Link
              href={ROUTES.followup}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 transition-colors"
            >
              {tp("updateFollowupDetail")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Selecciona tus necesidades */}
      <NeedsSelector userId={userId} />

      {/* Flujo personalizado (según selección) */}
      <FlujoPersonalizadoView userId={userId} />

      {/* Resumen ejecutivo */}
      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <h2 className="text-base font-semibold text-rehub-950">
              {tp("personalizedTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-900/55">
              {tp("personalizedSummary", {
                areasCount: necesidades.length,
                recsCount: todasRecomendaciones.length,
              })}
            </p>
          </div>
          <div className="px-6 lg:px-8 py-6">
            {/* Necesidades prioritarias */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-rehub-900/55 uppercase tracking-wider mb-3">
                {tp("identifiedNeeds")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {necesidades.map((n) => (
                  <span
                    key={n.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      n.prioridad === "alta"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : n.prioridad === "media"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rehub-50 text-rehub-700 border-rehub-200"
                    }`}
                  >
                    {n.titulo}
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist de acciones prioritarias */}
            <div>
              <h3 className="text-xs font-semibold text-rehub-900/55 uppercase tracking-wider mb-3">
                {tp("priorityActions")}
              </h3>
              <Stagger className="space-y-2">
                {CHECKLIST_PRIORITARIO.map((item) => (
                  <StaggerItem key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl border border-rehub-100 hover:border-rehub-300 hover:bg-rehub-50/60 transition-all group"
                    >
                      <Circle className="w-5 h-5 shrink-0 text-rehub-200 group-hover:text-rehub-500 transition-colors" />
                      <span className="font-medium text-rehub-950 text-sm">
                        {item.texto}
                      </span>
                      <ArrowRight className="ml-auto w-4 h-4 text-rehub-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Recomendaciones: alta prioridad */}
      {recAlta.length > 0 && (
        <Reveal delay={0.05}>
          <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
            <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
              <h2 className="text-base font-semibold text-rehub-950">
                {tp("recsHighTitle")}
              </h2>
              <p className="mt-1 text-sm text-rehub-900/55">
                {tp("recsHighSubtitle")}
              </p>
            </div>
            <div className="px-6 lg:px-8 py-6">
              <Stagger className="space-y-3">
                {recAlta.map((r) => (
                  <StaggerItem key={r.id}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-red-100 bg-gradient-to-br from-red-50/80 to-red-50/30 transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-red-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {r.categoria && (
                            <span className="rounded-full border border-rehub-200 bg-rehub-50 px-3 py-1 text-xs font-semibold text-rehub-700">
                              {categoryLabel(r.categoria)}
                            </span>
                          )}
                          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            Alta prioridad
                          </span>
                        </div>
                        <h4 className="font-semibold text-rehub-950 mt-2">{r.titulo}</h4>
                        <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                          {r.descripcion}
                        </p>
                      </div>
                      <Link
                        href={r.href ?? ROUTES.resources}
                        className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-4 py-2 text-sm font-semibold text-rehub-800 hover:bg-rehub-50 transition-all"
                      >
                        {r.accion ?? tp("seeMore")}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        </Reveal>
      )}

      {/* Recomendaciones: media y resto */}
      {(recMedia.length > 0 || recBaja.length > 0) && (
        <Reveal delay={0.05}>
          <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
            <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
              <h2 className="text-base font-semibold text-rehub-950">
                {tp("recsMoreTitle")}
              </h2>
              <p className="mt-1 text-sm text-rehub-900/55">
                {tp("recsMoreSubtitle")}
              </p>
            </div>
            <div className="px-6 lg:px-8 py-6">
              <Stagger className="space-y-3">
                {[...recMedia, ...recBaja].map((r) => (
                  <StaggerItem key={r.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 transition-all hover:-translate-y-0.5 hover:shadow-card hover:border-rehub-200">
                      <div className="flex-1 min-w-0">
                        {r.categoria && (
                          <span className="rounded-full border border-rehub-200 bg-rehub-50 px-3 py-1 text-xs font-semibold text-rehub-700">
                            {categoryLabel(r.categoria)}
                          </span>
                        )}
                        <h4 className="font-medium text-rehub-950 mt-1.5">
                          {r.titulo}
                        </h4>
                        <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                          {r.descripcion}
                        </p>
                      </div>
                      <Link
                        href={r.href ?? ROUTES.resources}
                        className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-4 py-2 text-sm font-semibold text-rehub-800 hover:bg-rehub-50 transition-all"
                      >
                        {r.accion ?? tp("seeMore")}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        </Reveal>
      )}

      {/* Trámites República Dominicana */}
      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <h2 className="text-base font-semibold text-rehub-950">
              {tp("proceduresTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-900/55">
              {tp("proceduresSubtitle")}
            </p>
          </div>
          <div className="px-6 lg:px-8 py-6">
            <Stagger className="space-y-3 text-sm">
              <StaggerItem>
                <div className="p-4 rounded-xl bg-gradient-to-br from-white to-rehub-50/50 border border-rehub-100">
                  <h4 className="font-semibold text-rehub-950 mb-1.5">
                    {tp("proceduresArsTitle")}
                  </h4>
                  <p className="text-rehub-900/65 text-pretty">
                    {tp("proceduresArsBody")}
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="p-4 rounded-xl bg-gradient-to-br from-white to-rehub-50/50 border border-rehub-100">
                  <h4 className="font-semibold text-rehub-950 mb-1.5">
                    {tp("proceduresIdopprilTitle")}
                  </h4>
                  <p className="text-rehub-900/65 text-pretty">
                    {tp("proceduresIdopprilBody")}
                  </p>
                </div>
              </StaggerItem>
            </Stagger>
            <div className="mt-4">
              <Link
                href={ROUTES.resources}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 transition-colors"
              >
                {tp("proceduresGuideLink")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Recordatorios */}
      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <h2 className="text-base font-semibold text-rehub-950">
              {tp("remindersTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-900/55">
              {tp("remindersSubtitle")}
            </p>
          </div>
          <div className="px-6 lg:px-8 py-6">
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RECORDATORIOS_SUGERIDOS.map((rem) => (
                <StaggerItem key={rem.id}>
                  <Link
                    href={rem.href}
                    className="group flex flex-col p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:-translate-y-0.5 hover:shadow-elevated transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      {"frecuencia" in rem && (
                        <span className="rounded-full border border-rehub-200 bg-rehub-50 px-2.5 py-0.5 text-xs font-semibold text-rehub-700">
                          {(rem as { frecuencia?: string }).frecuencia}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors text-sm">
                      {rem.titulo}
                    </h4>
                    <p className="text-sm text-rehub-900/60 mt-1 flex-1 text-pretty">
                      {rem.descripcion}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rehub-600">
                      {tp("reminderGo")}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </Reveal>

      {/* Ayuda gratuita y Planes de acogida */}
      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <h2 className="text-base font-semibold text-rehub-950">
              {tp("helpSectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-900/55">
              {tp("helpSectionSubtitle")}
            </p>
          </div>
          <div className="px-6 lg:px-8 py-6">
            <Stagger className="grid sm:grid-cols-2 gap-4">
              <StaggerItem>
                <Link
                  href={hrefResourcesHash("ayuda-gratuita")}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 hover:border-rehub-300 hover:-translate-y-0.5 hover:shadow-elevated transition-all"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors text-sm">
                      {tFlow("freeHelpTitle")}
                    </h3>
                    <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                      {tp("freeHelpCardBody")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rehub-600">
                      {tp("viewResourcesArrow")}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href={hrefResourcesHash("planes-acogida")}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:-translate-y-0.5 hover:shadow-elevated transition-all"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors text-sm">
                      {tFlow("shelterTitle")}
                    </h3>
                    <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                      {tp("shelterCardBody")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rehub-600">
                      {tp("viewResourcesArrow")}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href={hrefResourcesHash("sitios-cercanos")}
                  className="group flex items-start gap-4 p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:-translate-y-0.5 hover:shadow-elevated transition-all"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors text-sm">
                      {tp("nearbyCardTitle")}
                    </h3>
                    <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                      {tp("nearbyCardBody")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rehub-600">
                      {tp("nearbyCardLink")}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            </Stagger>
          </div>
        </section>
      </Reveal>

      {/* Próximos pasos */}
      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-rehub-100/40 p-6 lg:p-8 shadow-card">
          <h3 className="font-semibold text-rehub-950 mb-4 text-base">{tp("nextStepsTitle")}</h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href={ROUTES.followup}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              {tp("updateFollowup")}
            </Link>
            <Link
              href={ROUTES.resources}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rehub-200 bg-white px-5 py-2.5 font-semibold text-rehub-800 hover:bg-rehub-50 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              {tNav("resources")}
            </Link>
            <Link
              href={ROUTES.profile}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rehub-200 bg-white px-5 py-2.5 font-semibold text-rehub-800 hover:bg-rehub-50 transition-all"
            >
              <User className="w-4 h-4" />
              {tp("reviewProfile")}
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
