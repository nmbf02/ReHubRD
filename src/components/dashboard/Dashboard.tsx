"use client";

import { useState, useEffect, useMemo } from "react";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  User,
  ClipboardList,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Check,
  Phone,
  Gift,
  Home,
  Compass,
} from "lucide-react";
import { getPerfilInicial, calcularProgreso } from "@/lib/profile-store";
import SugerenciasRecordatorios from "@/components/dashboard/SuggestionsAndRecommendations";
import { getAccountData } from "@/lib/account-store";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface Props {
  userName?: string | null;
  userId?: string | null;
}

function pasoActual(progreso: number): number {
  if (progreso < 25) return 1;
  if (progreso < 50) return 2;
  if (progreso < 75) return 3;
  return 4;
}

export function InicioDashboard({ userName, userId }: Props) {
  const mounted = useIsClientMounted();
  const [progreso, setProgreso] = useState(0);
  const t = useTranslations("dashboard.inicio");
  const tCommon = useTranslations("common");

  const FLUJO_PASOS = useMemo(
    () => [
      {
        paso: 1,
        titulo: t("steps.profile.title"),
        descripcion: t("steps.profile.desc"),
        href: ROUTES.profile,
        Icon: User,
      },
      {
        paso: 2,
        titulo: t("steps.plan.title"),
        descripcion: t("steps.plan.desc"),
        href: ROUTES.plan,
        Icon: ClipboardList,
      },
      {
        paso: 3,
        titulo: t("steps.followup.title"),
        descripcion: t("steps.followup.desc"),
        href: ROUTES.followup,
        Icon: RefreshCw,
      },
      {
        paso: 4,
        titulo: t("steps.resources.title"),
        descripcion: t("steps.resources.desc"),
        href: ROUTES.resources,
        Icon: BookOpen,
      },
    ],
    [t]
  );

  const CARDS_ACCESO = useMemo(
    () => [
      {
        title: t("cards.profile.title"),
        desc: t("cards.profile.desc"),
        href: ROUTES.profile,
        Icon: User,
      },
      {
        title: t("cards.plan.title"),
        desc: t("cards.plan.desc"),
        href: ROUTES.plan,
        Icon: ClipboardList,
      },
      {
        title: t("cards.followup.title"),
        desc: t("cards.followup.desc"),
        href: ROUTES.followup,
        Icon: RefreshCw,
      },
      {
        title: t("cards.resources.title"),
        desc: t("cards.resources.desc"),
        href: ROUTES.resources,
        Icon: BookOpen,
      },
    ],
    [t]
  );

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setProgreso(calcularProgreso(perfil));
  }, [mounted, userId]);

  const displayName =
    (mounted && getAccountData(userId ?? undefined)?.showName) ||
    userName ||
    tCommon("userFallback");

  const pasoEnCurso = pasoActual(progreso);
  const pasoActualData = FLUJO_PASOS[pasoEnCurso - 1];
  const accionSugerida =
    progreso < 25
      ? { href: ROUTES.profile, label: t("actionCompleteProfile") }
      : progreso < 75
        ? { href: ROUTES.plan, label: t("actionViewPlan") }
        : { href: ROUTES.followup, label: t("actionUpdateFollowup") };

  return (
    <div className="space-y-8">
      {/* Welcome panel */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-rehub-100 bg-gradient-to-br from-white via-rehub-50/60 to-rehub-100/40 p-6 shadow-card lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rehub-300/30 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-balance text-2xl font-bold tracking-tightest text-rehub-950 lg:text-3xl">
                {t("greeting", { name: displayName })}
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-base leading-relaxed text-rehub-900/70">
                {t("heroSub")}
              </p>
            </div>
            {mounted && (
              <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="min-w-[200px] rounded-2xl border border-rehub-100 bg-white/80 p-4 shadow-soft backdrop-blur">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rehub-900/55">
                    {t("progressLabel")}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-rehub-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-brand-gradient"
                      />
                    </div>
                    <span className="w-12 text-sm font-bold tabular-nums text-rehub-950">
                      {progreso}%
                    </span>
                  </div>
                </div>
                {progreso < 100 && (
                  <Link
                    href={accionSugerida.href}
                    className="group inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
                  >
                    {accionSugerida.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Quick help line */}
      <Reveal delay={0.05}>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rehub-100 bg-white px-5 py-4 shadow-soft">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-rehub-900/70">
            <Phone className="h-4 w-4 text-rehub-600" />
            {t("quickHelp")}
          </span>
          <a href="tel:911" className="text-sm font-semibold text-red-600 hover:underline">
            911
          </a>
          <span className="text-rehub-300">·</span>
          <a
            href="tel:811"
            className="text-sm font-semibold text-rehub-700 hover:underline"
          >
            {t("mentalHealthLine")}
          </a>
          <span className="text-rehub-300">·</span>
          <a
            href="tel:8092001400"
            className="text-sm font-semibold text-rehub-700 hover:underline"
          >
            809-200-1400
          </a>
        </div>
      </Reveal>

      <SugerenciasRecordatorios progreso={progreso} userId={userId} />

      {/* Flow stepper */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <div className="border-b border-rehub-100 px-6 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-rehub-950">
                  {t("flowTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-rehub-900/60">{t("flowSubtitle")}</p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {FLUJO_PASOS.map((item, i) => {
                const esActual = item.paso === pasoEnCurso;
                const esCompletado = item.paso < pasoEnCurso;
                return (
                  <span key={item.paso} className="contents">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        esActual
                          ? "bg-rehub-600 text-white shadow-glow"
                          : esCompletado
                            ? "bg-rehub-50 text-rehub-700 hover:bg-rehub-100"
                            : "bg-rehub-50/60 text-rehub-900/70 hover:bg-rehub-100 hover:text-rehub-950"
                      }`}
                    >
                      {esCompletado ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="tabular-nums">{item.paso}</span>
                      )}
                      <span className="hidden sm:inline">{item.titulo}</span>
                    </Link>
                    {i < FLUJO_PASOS.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 text-rehub-300 sm:inline" />
                    )}
                  </span>
                );
              })}
            </div>
            {pasoActualData && (
              <div className="mt-6 rounded-2xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-5">
                <p className="text-sm leading-relaxed text-rehub-900/70">
                  <span className="font-semibold text-rehub-950">
                    {pasoActualData.titulo}:
                  </span>{" "}
                  {pasoActualData.descripcion}
                </p>
                <Link
                  href={pasoActualData.href}
                  className="group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rehub-700 transition-colors hover:text-rehub-800"
                >
                  {t("goToStep")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* Quick access */}
      <section>
        <Reveal>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-rehub-900/60">
            {t("quickAccessTitle")}
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARDS_ACCESO.map(({ title, desc, href, Icon }) => (
            <StaggerItem key={title}>
              <Link
                href={href}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-rehub-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 transition-colors group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-rehub-950 transition-colors group-hover:text-rehub-700">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-rehub-900/60">{desc}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <Stagger className="mt-4 grid gap-4 sm:grid-cols-2">
          <StaggerItem>
            <Link
              href={hrefResourcesHash("ayuda-gratuita")}
              className="group flex h-full items-center gap-4 rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Gift className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold text-rehub-950 transition-colors group-hover:text-rehub-700">
                  {t("freeHelpTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-rehub-900/65">
                  {t("freeHelpDesc")}
                </p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={hrefResourcesHash("planes-acogida")}
              className="group flex h-full items-center gap-4 rounded-2xl border border-rehub-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 transition-colors group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow">
                <Home className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold text-rehub-950 transition-colors group-hover:text-rehub-700">
                  {t("shelterTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-rehub-900/65">
                  {t("shelterDesc")}
                </p>
              </div>
            </Link>
          </StaggerItem>
        </Stagger>
      </section>
    </div>
  );
}
