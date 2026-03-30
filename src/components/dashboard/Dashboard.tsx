"use client";

import { useState, useEffect, useMemo } from "react";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  IconUser,
  IconClipboard,
  IconRefresh,
  IconBook,
} from "@/components/ui/Icons";
import { getPerfilInicial, calcularProgreso } from "@/lib/profile-store";
import SugerenciasRecordatorios from "@/components/dashboard/SuggestionsAndRecommendations";
import { getAccountData } from "@/lib/account-store";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";

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
        Icon: IconUser,
      },
      {
        paso: 2,
        titulo: t("steps.plan.title"),
        descripcion: t("steps.plan.desc"),
        href: ROUTES.plan,
        Icon: IconClipboard,
      },
      {
        paso: 3,
        titulo: t("steps.followup.title"),
        descripcion: t("steps.followup.desc"),
        href: ROUTES.followup,
        Icon: IconRefresh,
      },
      {
        paso: 4,
        titulo: t("steps.resources.title"),
        descripcion: t("steps.resources.desc"),
        href: ROUTES.resources,
        Icon: IconBook,
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
        Icon: IconUser,
      },
      {
        title: t("cards.plan.title"),
        desc: t("cards.plan.desc"),
        href: ROUTES.plan,
        Icon: IconClipboard,
      },
      {
        title: t("cards.followup.title"),
        desc: t("cards.followup.desc"),
        href: ROUTES.followup,
        Icon: IconRefresh,
      },
      {
        title: t("cards.resources.title"),
        desc: t("cards.resources.desc"),
        href: ROUTES.resources,
        Icon: IconBook,
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
      <div className="rounded-2xl bg-gradient-to-br from-rehub-primary/10 via-rehub-accent/5 to-transparent border border-rehub-primary/20 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-rehub-dark tracking-tight">
              {t("greeting", { name: displayName })}
            </h1>
            <p className="mt-2 text-rehub-dark/80 text-base max-w-xl">{t("heroSub")}</p>
          </div>
          {mounted && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="min-w-[200px]">
                <p className="text-xs font-medium text-rehub-dark/60 uppercase tracking-wider mb-2">
                  {t("progressLabel")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-200/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progreso}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-rehub-primary rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-rehub-dark tabular-nums w-12">
                    {progreso}%
                  </span>
                </div>
              </div>
              {progreso < 100 && (
                <Link
                  href={accionSugerida.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-rehub-primary rounded-xl hover:bg-rehub-secondary transition-colors"
                >
                  {accionSugerida.label}
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl bg-slate-100/80 border border-slate-200/80">
        <span className="text-sm font-medium text-rehub-dark/80">{t("quickHelp")}</span>
        <a href="tel:911" className="text-sm font-semibold text-red-600 hover:underline">911</a>
        <span className="text-slate-300">·</span>
        <a href="tel:811" className="text-sm font-semibold text-rehub-primary hover:underline">{t("mentalHealthLine")}</a>
        <span className="text-slate-300">·</span>
        <a href="tel:8092001400" className="text-sm font-semibold text-rehub-primary hover:underline">809-200-1400</a>
      </div>

      <SugerenciasRecordatorios progreso={progreso} userId={userId} />

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">{t("flowTitle")}</h2>
          <p className="mt-1 text-sm text-rehub-dark/60">{t("flowSubtitle")}</p>
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
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      esActual
                        ? "bg-rehub-primary text-white shadow-md"
                        : esCompletado
                          ? "bg-rehub-primary/10 text-rehub-primary hover:bg-rehub-primary/20"
                          : "bg-slate-100 text-rehub-dark/70 hover:bg-slate-200 hover:text-rehub-dark"
                    }`}
                  >
                    {esCompletado ? "✓" : item.paso}
                    <span className="hidden sm:inline">{item.titulo}</span>
                  </Link>
                  {i < FLUJO_PASOS.length - 1 && (
                    <span className="text-slate-300 hidden sm:inline">→</span>
                  )}
                </span>
              );
            })}
          </div>
          {pasoActualData && (
            <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-rehub-dark/80">
                <span className="font-semibold text-rehub-dark">{pasoActualData.titulo}:</span>{" "}
                {pasoActualData.descripcion}
              </p>
              <Link
                href={pasoActualData.href}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:text-rehub-secondary"
              >
                {t("goToStep")}
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider mb-4">
          {t("quickAccessTitle")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS_ACCESO.map(({ title, desc, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-3 p-5 bg-white rounded-xl border border-slate-200/80 hover:border-rehub-primary/30 hover:shadow-lg transition-all duration-200"
            >
              <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-rehub-primary/10 group-hover:text-rehub-primary transition-colors [&_svg]:h-6 [&_svg]:w-6">
                <Icon />
              </span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-rehub-dark/60 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Link
            href={hrefResourcesHash("ayuda-gratuita")}
            className="flex items-center gap-4 p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-colors group"
          >
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary">{t("freeHelpTitle")}</h3>
              <p className="text-sm text-rehub-dark/70">{t("freeHelpDesc")}</p>
            </div>
          </Link>
          <Link
            href={hrefResourcesHash("planes-acogida")}
            className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition-colors group"
          >
            <span className="text-2xl">🏠</span>
            <div>
              <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary">{t("shelterTitle")}</h3>
              <p className="text-sm text-rehub-dark/70">{t("shelterDesc")}</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
