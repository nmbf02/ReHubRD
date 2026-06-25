"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ClipboardList,
  RefreshCw,
  Map,
  Gift,
  Home,
  Phone,
  Globe,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  Stethoscope,
  Scale,
  Users,
  Building2,
} from "lucide-react";
import {
  GUIAS_APOYO,
  SECCIONES_RECURSOS,
} from "@/lib/resources-guide";
import { ESCENARIOS } from "@/lib/scenary-workflow";
import { ROUTES, hrefResourcesGuide } from "@/lib/routes";
import { useScenarioCopy } from "@/hooks/use-scenario-copy";
import { SitiosCercanosView } from "./ClosePlacesView";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface Props {
  userId?: string | null;
}

export function RecursosView({ userId }: Props) {
  const tr = useTranslations("dashboard.resourcesPage");
  const tNav = useTranslations("dashboard.nav");
  const tFlow = useTranslations("dashboard.inicio");
  const sc = useScenarioCopy();
  const searchParams = useSearchParams();
  const guiaId = searchParams.get("guia");
  const guiaSeleccionada =
    guiaId && guiaId in GUIAS_APOYO ? guiaId : null;
  const guia = guiaSeleccionada ? GUIAS_APOYO[guiaSeleccionada] : null;

  return (
    <div className="space-y-6">
      {/* Flujo de recuperación */}
      <Reveal>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-4 border-b border-rehub-100/80 bg-gradient-to-r from-rehub-50/60 to-transparent">
            <h2 className="text-xs font-semibold text-rehub-700 uppercase tracking-wider">
              {tFlow("flowTitle")}
            </h2>
          </div>
          <div className="px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={ROUTES.profile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rehub-50 border border-rehub-100 text-rehub-700 hover:bg-rehub-100 hover:border-rehub-200 transition-all text-sm font-medium"
              >
                1. {tNav("profile")}
              </Link>
              <ChevronRight className="h-4 w-4 text-rehub-300 hidden sm:block" />
              <Link
                href={ROUTES.plan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rehub-50 border border-rehub-100 text-rehub-700 hover:bg-rehub-100 hover:border-rehub-200 transition-all text-sm font-medium"
              >
                2. {tNav("plan")}
              </Link>
              <ChevronRight className="h-4 w-4 text-rehub-300 hidden sm:block" />
              <Link
                href={ROUTES.followup}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rehub-50 border border-rehub-100 text-rehub-700 hover:bg-rehub-100 hover:border-rehub-200 transition-all text-sm font-medium"
              >
                3. {tNav("followup")}
              </Link>
              <ChevronRight className="h-4 w-4 text-rehub-300 hidden sm:block" />
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rehub-600 text-white text-sm font-semibold shadow-glow">
                4. {tNav("resources")}
              </span>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Mensaje de apoyo */}
      <Reveal delay={0.05}>
        <div className="relative overflow-hidden rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rehub-400/15 blur-3xl" aria-hidden />
          <p className="relative text-lg font-medium text-rehub-950 text-pretty">
            {tr.rich("supportIntro", {
              highlight: (chunks) => (
                <strong className="text-rehub-700">{chunks}</strong>
              ),
            })}
          </p>
        </div>
      </Reveal>

      {/* Guía: Flujos por situación */}
      <Reveal delay={0.08}>
        <section
          id="flujos-guia"
          className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden scroll-mt-6"
        >
          <div className="px-6 lg:px-8 py-6 border-b border-rehub-100/80">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 shrink-0">
                <Map className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {tr("flowsTitle")}
                </h2>
                <p className="text-sm text-rehub-900/60 mt-0.5">
                  {tr("flowsIntro")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ESCENARIOS.filter((e) => e.id !== "general").map((esc) => (
                <StaggerItem key={esc.id}>
                  <Link
                    href={ROUTES.followup}
                    className={`group flex flex-col p-5 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${
                      esc.prioridad === "urgente"
                        ? "bg-red-50/60 border-red-200 hover:border-red-300 hover:shadow-md"
                        : "bg-white border-rehub-100 hover:border-rehub-200 hover:shadow-elevated"
                    }`}
                  >
                    <h3 className="font-semibold text-rehub-950">
                      {sc.nombre(esc.id)}
                    </h3>
                    <p className="text-xs text-rehub-900/60 mt-1.5 line-clamp-2 text-pretty flex-1">
                      {sc.descripcion(esc.id)}
                    </p>
                    <p className="text-xs text-rehub-900/45 mt-2">
                      {tr("flowsFollowupFreq", {
                        freq: sc.frecuenciaSeguimiento(esc.id),
                      })}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rehub-600 group-hover:gap-2 transition-all">
                      {tr("flowsCta")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="mt-5 p-4 rounded-xl bg-rehub-50/80 border border-rehub-100">
              <p className="text-sm text-rehub-900/75 text-pretty">
                {tr.rich("howItWorksBody", {
                  bold: (chunks) => <strong className="text-rehub-950">{chunks}</strong>,
                  followup: (chunks) => (
                    <Link
                      href={ROUTES.followup}
                      className="text-rehub-600 hover:text-rehub-700 hover:underline font-medium"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ¿Qué necesitas? */}
      <Reveal delay={0.1}>
        <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-rehub-100/80">
            <h2 className="text-base font-semibold text-rehub-950">
              {tr("needsTitle")}
            </h2>
            <p className="mt-1 text-sm text-rehub-900/55">
              {tr("needsSubtitle")}
            </p>
          </div>
          <div className="p-6 lg:p-8">
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SECCIONES_RECURSOS.map((sec) => {
                const isActive = guiaSeleccionada === sec.id;
                const href = isActive
                  ? ROUTES.resources
                  : hrefResourcesGuide(sec.id);
                return (
                  <StaggerItem key={sec.id}>
                    <Link
                      href={href}
                      className={`group flex flex-col items-start p-5 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${
                        isActive
                          ? "bg-rehub-600 border-rehub-500 shadow-glow ring-2 ring-rehub-500/20"
                          : "bg-white border-rehub-100 hover:border-rehub-200 hover:shadow-elevated"
                      }`}
                    >
                      <h3
                        className={`font-semibold ${
                          isActive ? "text-white" : "text-rehub-950"
                        }`}
                      >
                        {sec.titulo}
                      </h3>
                      <p
                        className={`text-sm mt-1.5 text-pretty flex-1 ${
                          isActive ? "text-white/80" : "text-rehub-900/55"
                        }`}
                      >
                        {sec.resumen}
                      </p>
                      <span
                        className={`mt-3 inline-flex items-center gap-1 text-sm font-medium transition-all ${
                          isActive
                            ? "text-white/90 group-hover:gap-2"
                            : "text-rehub-600 group-hover:gap-2"
                        }`}
                      >
                        {isActive ? tr("guideViewActive") : tr("guideViewExpand")}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>
      </Reveal>

      {/* Guía expandida */}
      {guia && (
        <Reveal>
          <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
            <div className="px-6 lg:px-8 py-6 border-b border-rehub-100/80">
              <Link
                href={ROUTES.resources}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 transition-colors mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {tr("backToAll")}
              </Link>
              <h2 className="text-base font-semibold text-rehub-950">
                {guia.titulo}
              </h2>
              <p className="mt-1 text-sm text-rehub-900/65 text-pretty">
                {guia.descripcion}
              </p>
            </div>
            <div className="p-6 lg:p-8 space-y-6">
              {guia.pasos && guia.pasos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-rehub-950 mb-3">
                    {tr("stepsHeading")}
                  </h3>
                  <ol className="space-y-2.5">
                    {guia.pasos.map((paso, i) => (
                      <li
                        key={i}
                        className="flex gap-3 p-4 rounded-xl bg-rehub-50/70 border border-rehub-100"
                      >
                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-rehub-600 text-white font-semibold text-xs">
                          {i + 1}
                        </span>
                        <span className="text-sm text-rehub-900/85 text-pretty">
                          {paso}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {guia.contactos && guia.contactos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-rehub-950 mb-3">
                    {tr("contactsHeading")}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {guia.contactos.map((c) => (
                      <a
                        key={c.nombre}
                        href={
                          c.tipo === "tel"
                            ? `tel:${c.valor.replace(/\D/g, "")}`
                            : c.tipo === "web"
                              ? (c.valor.startsWith("http") ? c.valor : `https://${c.valor}`)
                              : "#"
                        }
                        target={c.tipo === "web" ? "_blank" : undefined}
                        rel={c.tipo === "web" ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-rehub-50 border border-rehub-200 text-rehub-700 rounded-xl font-medium hover:bg-rehub-100 hover:border-rehub-300 transition-all text-sm"
                      >
                        {c.tipo === "tel" ? (
                          <Phone className="h-3.5 w-3.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                        {c.nombre}: {c.valor}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {guia.nota && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-900 text-pretty">
                    <strong>{tr("notePrefix")}</strong> {guia.nota}
                  </p>
                </div>
              )}
            </div>
          </section>
        </Reveal>
      )}

      {/* Ayuda gratuita */}
      <Reveal delay={0.08}>
        <section
          id="ayuda-gratuita"
          className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden scroll-mt-6"
        >
          <div className="px-6 lg:px-8 py-6 border-b border-rehub-100/80">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 shrink-0">
                <Gift className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {tr("freeHelpSectionTitle")}
                </h2>
                <p className="text-sm text-rehub-900/55 mt-0.5">
                  {tr("freeHelpSectionSubtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("mhTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("mhBody")}
                  </p>
                  <a
                    href="tel:811"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {tr("call811")}
                  </a>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("medTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("medBody")}
                  </p>
                  <p className="mt-2 text-xs text-rehub-900/50">
                    {tr("medHint")}
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("publicCareTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("publicCareBody")}
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("adrTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("adrBody")}
                  </p>
                  <a
                    href="https://rehabilitacion.org.do"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    rehabilitacion.org.do
                  </a>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <Users className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("socialTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("socialBody")}
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="h-full p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 hover:border-rehub-200 hover:shadow-card transition-all">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 mb-3">
                    <Scale className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-rehub-950 text-sm">
                    {tr("legalTitle")}
                  </h3>
                  <p className="text-sm text-rehub-900/65 mt-1.5 text-pretty">
                    {tr("legalBody")}
                  </p>
                  <a
                    href="https://idoppril.gob.do"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    idoppril.gob.do
                  </a>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </section>
      </Reveal>

      {/* Sitios cercanos por provincia */}
      <SitiosCercanosView userId={userId} />

      {/* Planes de acogida */}
      <Reveal delay={0.06}>
        <section
          id="planes-acogida"
          className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden scroll-mt-6"
        >
          <div className="px-6 lg:px-8 py-6 border-b border-rehub-100/80">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 shrink-0">
                <Home className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-rehub-950">
                  {tr("shelterSectionTitle")}
                </h2>
                <p className="text-sm text-rehub-900/55 mt-0.5">
                  {tr("shelterSectionSubtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white">
                <h3 className="font-semibold text-rehub-950">
                  {tr("adrOrgTitle")}
                </h3>
                <p className="text-sm text-rehub-900/65 mt-2 text-pretty">
                  {tr("adrOrgBody")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <a
                    href="tel:8096897151"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-rehub-600 text-white rounded-xl text-sm font-semibold shadow-glow hover:bg-rehub-700 hover:shadow-glow-lg transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Tel: 809-689-7151
                  </a>
                  <a
                    href="https://wa.me/18099690565"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-rehub-200 bg-white text-rehub-700 rounded-xl text-sm font-medium hover:bg-rehub-50 hover:border-rehub-300 transition-all"
                  >
                    WhatsApp: 809-969-0565
                  </a>
                </div>
                <a
                  href="https://rehabilitacion.org.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  rehabilitacion.org.do
                </a>
              </div>
              <div className="p-5 rounded-xl border border-rehub-100 bg-white hover:border-rehub-200 hover:shadow-card transition-all">
                <h3 className="font-semibold text-rehub-950">
                  {tr("postDischargeTitle")}
                </h3>
                <p className="text-sm text-rehub-900/65 mt-2 text-pretty">
                  {tr("postDischargeBody")}
                </p>
                <Link
                  href={ROUTES.plan}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-rehub-600 hover:text-rehub-700 hover:underline"
                >
                  {tr("seePlanInRehub")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-rehub-50/70 border border-rehub-100">
              <h4 className="text-sm font-semibold text-rehub-950">
                {tr("otherShelterTitle")}
              </h4>
              <ul className="mt-2.5 text-sm text-rehub-900/75 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rehub-400 shrink-0" />
                  {tr("otherShelter1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rehub-400 shrink-0" />
                  {tr("otherShelter2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rehub-400 shrink-0" />
                  {tr("otherShelter3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rehub-400 shrink-0" />
                  {tr("otherShelter4")}
                </li>
              </ul>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Emergencias y líneas de ayuda */}
      <Reveal delay={0.06}>
        <section className="space-y-4">
          {/* Emergency banner */}
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-900 font-medium text-pretty">
              {tr.rich("emergencyBanner", {
                phone: (chunks) => (
                  <a href="tel:911" className="font-bold text-red-700 hover:underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>

          {/* Crisis lines */}
          <div className="rounded-2xl border border-rehub-100 bg-white shadow-card p-6 lg:p-8">
            <h3 className="text-base font-semibold text-rehub-950 mb-4">
              {tr("talkNowTitle")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="tel:8092001400"
                className="group flex items-center gap-4 p-4 bg-rehub-50/70 border border-rehub-100 rounded-xl hover:border-rehub-200 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-rehub-200 transition-colors">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-rehub-950 text-sm">
                    {tr("mentalHealthService")}
                  </p>
                  <p className="text-xl font-bold text-rehub-600 tracking-tight">
                    809-200-1400
                  </p>
                  <p className="text-xs text-rehub-900/55 mt-0.5">
                    {tr("mentalHealthHint")}
                  </p>
                </div>
              </a>
              <a
                href="tel:811"
                className="group flex items-center gap-4 p-4 bg-rehub-50/70 border border-rehub-100 rounded-xl hover:border-rehub-200 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-rehub-200 transition-colors">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-rehub-950 text-sm">
                    {tr("nationalLine")}
                  </p>
                  <p className="text-xl font-bold text-rehub-600 tracking-tight">
                    811
                  </p>
                  <p className="text-xs text-rehub-900/55 mt-0.5">
                    {tr("line811Hint")}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Enlaces a otras secciones */}
      <Reveal delay={0.05}>
        <section className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.plan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
          >
            <ClipboardList className="h-4 w-4" />
            {tr("viewMyPlan")}
          </Link>
          <Link
            href={ROUTES.followup}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rehub-200 bg-white px-5 py-2.5 font-semibold text-rehub-800 hover:bg-rehub-50 hover:border-rehub-300 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            {tr("updateFollowup")}
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
