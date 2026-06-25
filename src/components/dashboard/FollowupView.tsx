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
  Activity,
  Heart,
  Pill,
  FileText,
  CheckCircle,
  Loader2,
  ChevronRight,
  Phone,
  Gift,
  Home,
  Stethoscope,
} from "lucide-react";
import { getPerfilInicial } from "@/lib/profile-store";
import {
  getCheckIns,
  saveCheckInAndUpdatePerfil,
  type HasAccessToMedication,
} from "@/lib/followup-store";
import {
  identificarEscenario,
  type FlujoEscenario,
} from "@/lib/scenary-workflow";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { useScenarioCopy } from "@/hooks/use-scenario-copy";
import type { PhysicalState, MobilityLevel, EmotionalState } from "@/types/profile";
import {
  OPCIONES_ESTADO_FISICO,
  OPCIONES_NIVEL_MOVILIDAD,
  OPCIONES_ESTADO_EMOCIONAL,
} from "@/types/profile";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface Props {
  userId?: string | null;
}

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const WELLBEING_COLORS: Record<number, string> = {
  1: "bg-red-500 text-white shadow-sm",
  2: "bg-orange-500 text-white shadow-sm",
  3: "bg-amber-500 text-white shadow-sm",
  4: "bg-teal-500 text-white shadow-sm",
  5: "bg-rehub-600 text-white shadow-glow",
};

const WELLBEING_IDLE = "bg-rehub-50 text-rehub-700 border border-rehub-200 hover:bg-rehub-100 hover:border-rehub-300";

export function SeguimientoView({ userId }: Props) {
  const mounted = useIsClientMounted();
  const t = useTranslations("dashboard.followup");
  const tNav = useTranslations("dashboard.nav");
  const tFlow = useTranslations("dashboard.inicio");
  const tCommon = useTranslations("common");
  const sc = useScenarioCopy();
  const [estadoFisico, setEstadoFisico] = useState<PhysicalState>("recuperacion");
  const [nivelMovilidad, setNivelMovilidad] = useState<MobilityLevel>("leves");
  const [estadoEmocional, setEstadoEmocional] = useState<EmotionalState>("estres");
  const [bienestar, setBienestar] = useState(3);
  const [accesoMedicamentos, setAccesoMedicamentos] = useState<HasAccessToMedication | "">("");
  const [notas, setNotas] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flujoRecomendado, setFlujoRecomendado] = useState<FlujoEscenario | null>(null);
  const [checkIns, setCheckIns] = useState<ReturnType<typeof getCheckIns>>([]);

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setEstadoFisico(perfil.estadoActual.physicalState ?? "recuperacion");
    setNivelMovilidad(perfil.estadoActual.mobilityLevel ?? "leves");
    setEstadoEmocional(perfil.estadoActual.emotionalState ?? "estres");
    const cis = getCheckIns(userId ?? undefined);
    setCheckIns(cis);
    // Mostrar flujo recomendado según último check-in si existe
    if (cis.length > 0) {
      const ultimo = cis[0]!;
      const escenario = identificarEscenario({
        bienestar: ultimo.wellBeing,
        nivelMovilidad: ultimo.movilityLevel,
        accesoMedicamentos: ultimo.hasAccessToMedication,
        redApoyo: perfil.contextoSocial?.redApoyo,
        estadoEmocional: ultimo.emotionalState,
      });
      setFlujoRecomendado(escenario);
    }
  }, [mounted, userId]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => setCheckIns(getCheckIns(userId ?? undefined));
    window.addEventListener("rehub-seguimiento-updated", handler);
    return () => window.removeEventListener("rehub-seguimiento-updated", handler);
  }, [mounted, userId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    setFlujoRecomendado(null);
    const perfil = getPerfilInicial(userId ?? undefined);
    const datosCheckIn = {
      physicalState: estadoFisico,
      movilityLevel: nivelMovilidad,
      emotionalState: estadoEmocional,
      wellBeing: bienestar,
      notes: notas.trim() || undefined,
      hasAccessToMedication: accesoMedicamentos || undefined,
    };
    saveCheckInAndUpdatePerfil(datosCheckIn, perfil, userId ?? undefined);
    const escenario = identificarEscenario({
      bienestar,
      nivelMovilidad,
      accesoMedicamentos: accesoMedicamentos || undefined,
      redApoyo: perfil.contextoSocial?.redApoyo,
      estadoEmocional,
    });
    setFlujoRecomendado(escenario);
    setIsSaving(false);
    setSaved(true);
    setCheckIns(getCheckIns(userId ?? undefined));
    setNotas("");
    setTimeout(() => setSaved(false), 5000);
  }

  if (!mounted) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flujo de recuperación */}
      <Reveal>
        <section className="bg-white rounded-2xl border border-rehub-100 shadow-soft overflow-hidden">
          <div className="px-6 lg:px-8 py-4 border-b border-rehub-100 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold text-rehub-950/70 uppercase tracking-wider">
              {tFlow("flowTitle")}
            </h2>
          </div>
          <div className="px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={ROUTES.profile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 border border-rehub-200 hover:bg-rehub-100 hover:border-rehub-300 hover:text-rehub-900 transition-all text-sm font-medium"
              >
                <User className="w-4 h-4" />
                1. {tNav("profile")}
              </Link>
              <ChevronRight className="w-4 h-4 text-rehub-300 hidden sm:block shrink-0" />
              <Link
                href={ROUTES.plan}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 border border-rehub-200 hover:bg-rehub-100 hover:border-rehub-300 hover:text-rehub-900 transition-all text-sm font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                2. {tNav("plan")}
              </Link>
              <ChevronRight className="w-4 h-4 text-rehub-300 hidden sm:block shrink-0" />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-600 text-white border border-rehub-600 text-sm font-semibold shadow-glow">
                <RefreshCw className="w-4 h-4" />
                3. {tNav("followup")}
              </span>
              <ChevronRight className="w-4 h-4 text-rehub-300 hidden sm:block shrink-0" />
              <Link
                href={ROUTES.resources}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-50 text-rehub-800 border border-rehub-200 hover:bg-rehub-100 hover:border-rehub-300 hover:text-rehub-900 transition-all text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                4. {tNav("resources")}
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Formulario de check-in */}
      <Reveal delay={0.05}>
        <section className="bg-white rounded-2xl border border-rehub-100 shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Stethoscope className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {t("newCheckInTitle")}
                </h2>
                <p className="text-sm text-rehub-900/60 mt-0.5">
                  {t("newCheckInSubtitle")}
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
            {/* Bienestar */}
            <div className="rounded-xl border border-rehub-100 bg-rehub-50/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <Heart className="w-4 h-4" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("wellbeingQuestion")}
                </label>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setBienestar(n)}
                    className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${
                      bienestar === n
                        ? WELLBEING_COLORS[n] ?? "bg-rehub-600 text-white shadow-glow"
                        : WELLBEING_IDLE
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-rehub-900/60">
                {t(`wellbeing.${bienestar}`)}
              </p>
            </div>

            {/* Estado físico */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("physicalState")}
                </label>
              </div>
              <select
                value={estadoFisico}
                onChange={(e) => setEstadoFisico(e.target.value as PhysicalState)}
                className="w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
              >
                {Object.entries(OPCIONES_ESTADO_FISICO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel movilidad */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <RefreshCw className="w-3.5 h-3.5" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("mobilityLevel")}
                </label>
              </div>
              <select
                value={nivelMovilidad}
                onChange={(e) => setNivelMovilidad(e.target.value as MobilityLevel)}
                className="w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
              >
                {Object.entries(OPCIONES_NIVEL_MOVILIDAD).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado emocional */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <Heart className="w-3.5 h-3.5" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("emotionalState")}
                </label>
              </div>
              <select
                value={estadoEmocional}
                onChange={(e) => setEstadoEmocional(e.target.value as EmotionalState)}
                className="w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
              >
                {Object.entries(OPCIONES_ESTADO_EMOCIONAL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicamentos */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <Pill className="w-3.5 h-3.5" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("medicationQuestion")}
                </label>
              </div>
              <select
                value={accesoMedicamentos}
                onChange={(e) => setAccesoMedicamentos(e.target.value as HasAccessToMedication | "")}
                className="w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
              >
                <option value="">{t("medOptionNa")}</option>
                <option value="si">{t("medOptionYes")}</option>
                <option value="no">{t("medOptionNo")}</option>
                <option value="parcial">{t("medOptionPartial")}</option>
                <option value="no_se">{t("medOptionUnknown")}</option>
              </select>
              <p className="mt-1.5 text-xs text-rehub-900/50">
                {t("medicationHint")}
              </p>
            </div>

            {/* Notas */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <label className="block text-sm font-medium text-rehub-900">
                  {t("notesLabel")}
                  <span className="text-rehub-900/45 font-normal ml-1">{tCommon("optionalMarker")}</span>
                </label>
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={3}
                className="w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("saveSaving")}
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t("saveSaved")}
                </>
              ) : (
                t("saveSubmit")
              )}
            </button>
          </form>
        </section>
      </Reveal>

      {/* Flujo recomendado (tras guardar) */}
      {flujoRecomendado && (
        <Reveal delay={0.05}>
          <section
            className={`rounded-2xl border overflow-hidden shadow-card ${
              flujoRecomendado.prioridad === "urgente"
                ? "bg-red-50/80 border-red-200"
                : "bg-white border-rehub-100"
            }`}
          >
            <div
              className={`px-6 lg:px-8 py-5 border-b ${
                flujoRecomendado.prioridad === "urgente"
                  ? "border-red-200"
                  : "border-rehub-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    flujoRecomendado.prioridad === "urgente"
                      ? "bg-red-100 text-red-600"
                      : "bg-brand-gradient text-white shadow-glow"
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-rehub-950">
                    {t("recommendedTitle")}
                  </h2>
                  <p className="text-sm text-rehub-900/70 mt-0.5">
                    {sc.nombre(flujoRecomendado.id)}
                  </p>
                  <p className="text-xs text-rehub-900/55 mt-1">
                    {t("suggestedFollowup", {
                      freq: sc.frecuenciaSeguimiento(flujoRecomendado.id),
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 lg:p-8 space-y-4">
              {flujoRecomendado.contactosDirectos && flujoRecomendado.contactosDirectos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {flujoRecomendado.contactosDirectos.map((c, i) => (
                    <a
                      key={`${c.numero}-${i}`}
                      href={`tel:${c.numero.replace(/\D/g, "")}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-600 text-white rounded-xl text-sm font-semibold shadow-glow hover:bg-rehub-700 hover:shadow-glow-lg transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      {sc.contactoNombre(flujoRecomendado.id, i)}: {c.numero}
                    </a>
                  ))}
                </div>
              )}
              <ol className="space-y-3">
                {flujoRecomendado.pasos.map((paso, i) => (
                  <li key={paso.orden} className="flex gap-4">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-rehub-100 text-rehub-700 font-semibold text-sm border border-rehub-200">
                      {paso.orden}
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-medium text-rehub-950">
                        {sc.pasoTitulo(flujoRecomendado.id, i)}
                      </p>
                      <p className="text-sm text-rehub-900/65 mt-0.5">
                        {sc.pasoDescripcion(flujoRecomendado.id, i)}
                      </p>
                      {paso.href && (
                        <Link
                          href={paso.href}
                          className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                            paso.urgente
                              ? "text-red-600 hover:text-red-700"
                              : "text-rehub-600 hover:text-rehub-700"
                          }`}
                        >
                          {sc.pasoAccion(flujoRecomendado.id, i)}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href={hrefResourcesHash("flujos-guia")}
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-rehub-600 hover:text-rehub-700 transition-colors"
              >
                {t("fullFlowGuideLink")}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* Historial */}
      <Reveal delay={0.08}>
        <section className="bg-white rounded-2xl border border-rehub-100 shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <RefreshCw className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {t("historyTitle")}
                </h2>
                <p className="text-sm text-rehub-900/60 mt-0.5">
                  {t("historySubtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            {checkIns.length === 0 ? (
              <div className="text-center py-12">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rehub-50 text-rehub-400 mx-auto mb-4">
                  <RefreshCw className="w-7 h-7" />
                </span>
                <p className="text-rehub-900/60 font-medium">{t("historyEmpty")}</p>
                <p className="text-sm text-rehub-900/45 mt-1">{t("historyEmptyHint")}</p>
              </div>
            ) : (
              <Stagger className="space-y-3">
                {checkIns.map((ci) => (
                  <StaggerItem key={ci.id}>
                    <div className="p-4 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-rehub-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-rehub-950">
                          {formatFecha(ci.date)}
                        </span>
                        <span className="rounded-full border border-rehub-200 bg-rehub-50 px-3 py-0.5 text-xs font-semibold text-rehub-700">
                          {t("wellbeingSummary", { n: ci.wellBeing })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-rehub-900/60">
                        <span>{OPCIONES_ESTADO_FISICO[ci.physicalState]}</span>
                        <span className="text-rehub-300">·</span>
                        <span>{OPCIONES_NIVEL_MOVILIDAD[ci.movilityLevel]}</span>
                        <span className="text-rehub-300">·</span>
                        <span>{OPCIONES_ESTADO_EMOCIONAL[ci.emotionalState]}</span>
                        {ci.hasAccessToMedication && (
                          <>
                            <span className="text-rehub-300">·</span>
                            <span>
                              {t("medicationSummary")}{" "}
                              {ci.hasAccessToMedication === "si"
                                ? t("medYesShort")
                                : ci.hasAccessToMedication === "no"
                                  ? t("medNoShort")
                                  : ci.hasAccessToMedication === "parcial"
                                    ? t("medPartialShort")
                                    : t("medNaShort")}
                            </span>
                          </>
                        )}
                      </div>
                      {ci.notes && (
                        <p className="mt-2 text-sm text-rehub-900/70 border-t border-rehub-100 pt-2">
                          {ci.notes}
                        </p>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>
      </Reveal>

      {/* Ayuda gratuita y Planes de acogida */}
      <Reveal delay={0.1}>
        <section className="bg-white rounded-2xl border border-rehub-100 shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-5 border-b border-rehub-100">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {t("helpShelterTitle")}
                </h2>
                <p className="text-sm text-rehub-900/60 mt-0.5">
                  {t("helpShelterSubtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <Stagger className="grid sm:grid-cols-2 gap-4">
              <StaggerItem>
                <Link
                  href={hrefResourcesHash("ayuda-gratuita")}
                  className="flex items-start gap-4 p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:-translate-y-0.5 hover:shadow-elevated hover:border-rehub-200 transition-all group"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow transition-all">
                    <Gift className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors">
                      {t("freeHelpCardTitle")}
                    </h3>
                    <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                      {t("freeHelpCardBody")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rehub-600 group-hover:gap-2 transition-all">
                      {t("viewResources")}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href={hrefResourcesHash("planes-acogida")}
                  className="flex items-start gap-4 p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:-translate-y-0.5 hover:shadow-elevated hover:border-rehub-200 transition-all group"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow transition-all">
                    <Home className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-rehub-950 group-hover:text-rehub-700 transition-colors">
                      {t("shelterCardTitle")}
                    </h3>
                    <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
                      {t("shelterCardBody")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rehub-600 group-hover:gap-2 transition-all">
                      {t("viewResources")}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            </Stagger>
          </div>
        </section>
      </Reveal>

      {/* Enlaces */}
      <Reveal delay={0.12}>
        <section className="rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-6 lg:p-8">
          <h3 className="font-semibold text-rehub-950 mb-4">{t("relatedTitle")}</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={ROUTES.plan}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
            >
              <ClipboardList className="w-4 h-4" />
              {t("viewMyPlan")}
            </Link>
            <Link
              href={ROUTES.resources}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rehub-200 bg-white px-5 py-2.5 font-semibold text-rehub-800 hover:bg-rehub-50 hover:border-rehub-300 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              {tNav("resources")}
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
