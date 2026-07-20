"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import {
  Home,
  User,
  ClipboardList,
  RefreshCw,
  BookOpen,
  Pill,
  Stethoscope,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { getAccountData } from "@/lib/account-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";

interface Props {
  user: Session["user"];
}

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const tDash = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const navItems = useMemo(
    () =>
      [
        { href: ROUTES.dashboard, key: "home" as const, Icon: Home as LucideIcon },
        { href: ROUTES.profile, key: "profile" as const, Icon: User as LucideIcon },
        { href: ROUTES.care, key: "care" as const, Icon: Stethoscope as LucideIcon },
        { href: ROUTES.plan, key: "plan" as const, Icon: ClipboardList as LucideIcon },
        { href: ROUTES.medications, key: "medications" as const, Icon: Pill as LucideIcon },
        { href: ROUTES.followup, key: "followup" as const, Icon: RefreshCw as LucideIcon },
        { href: ROUTES.resources, key: "resources" as const, Icon: BookOpen as LucideIcon },
        { href: ROUTES.account, key: "account" as const, Icon: Settings as LucideIcon },
      ] as const,
    []
  );

  const [nombreMostrar, setNombreMostrar] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const datos = getAccountData(user?.id);
      setNombreMostrar(datos?.showName ?? null);
    };
    update();
    window.addEventListener("rehub-cuenta-updated", update);
    return () => window.removeEventListener("rehub-cuenta-updated", update);
  }, [user?.id]);

  const displayName = nombreMostrar || user?.name || user?.email;
  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-rehub-100 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <BrandMark className="h-9 w-9" />
          <span className="text-lg font-bold text-rehub-950">{tCommon("brand")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.account}
            className="max-w-[120px] truncate text-sm font-medium text-rehub-900/70 hover:text-rehub-700"
          >
            {displayName ?? tCommon("userFallback")}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            aria-label={tDash("signOutMobile")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-rehub-100 bg-white/80 backdrop-blur-xl lg:flex">
        <div className="shrink-0 border-b border-rehub-100 p-6">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
            <BrandMark className="h-10 w-10" />
            <span className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-rehub-950">
                {tCommon("brand")}
              </span>
              <span className="mt-1 text-[11px] font-medium text-rehub-700/70">
                {tDash("tagline")}
              </span>
            </span>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-rehub-900/75 hover:bg-rehub-50 hover:text-rehub-800"
                )}
              >
                <item.Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-rehub-600/80 group-hover:text-rehub-700"
                  )}
                />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-rehub-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-rehub-50/70 px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-rehub-950">
                {displayName ?? tCommon("userFallback")}
              </p>
              <p className="truncate text-xs text-rehub-900/55">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {tDash("signOutDesktop")}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-rehub-100 bg-white/90 py-1.5 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[52px] flex-col items-center gap-1 rounded-lg px-1 py-1.5 transition-colors",
                isActive ? "text-rehub-700" : "text-rehub-900/50"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-rehub-100 text-rehub-700" : "text-rehub-900/55"
                )}
              >
                <item.Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
