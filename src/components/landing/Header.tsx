"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, LogOut, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandMark } from "@/components/brand/BrandMark";

const NAV_KEYS = [
  { href: "#problema", key: "problem" as const },
  { href: "#solucion", key: "solution" as const },
  { href: "#funcionamiento", key: "howItWorks" as const },
  { href: "#contacto", key: "contact" as const },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const tNav = useTranslations("landing.nav");
  const tHeader = useTranslations("landing.header");
  const common = useTranslations("common");

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <nav
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4",
          scrolled
            ? "border-rehub-100 bg-white/85 py-2 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-rehub-950/80"
            : "border-transparent bg-white/50 py-2.5 backdrop-blur-md dark:bg-rehub-950/40"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-9 w-9" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-rehub-950 dark:text-white">
              {common("brand")}
            </span>
            <span className="hidden text-[11px] font-medium text-rehub-700/70 dark:text-rehub-100/55 sm:inline">
              {common("tagline")}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_KEYS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3 py-2 text-sm font-medium text-rehub-900/70 transition-colors hover:text-rehub-700 dark:text-rehub-100/70 dark:hover:text-white"
            >
              {tNav(link.key)}
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-rehub-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-rehub-100/70 dark:bg-white/10" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-rehub-100 bg-white/70 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-rehub-200 hover:bg-rehub-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-700 text-sm font-semibold text-white">
                  {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="max-w-[110px] truncate text-sm font-medium text-rehub-900 dark:text-rehub-100">
                  {session.user?.name ?? session.user?.email}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-rehub-900/45 transition-transform dark:text-rehub-100/50", userMenuOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-rehub-100 bg-white p-1.5 shadow-elevated dark:border-white/10 dark:bg-rehub-900"
                    >
                      <div className="border-b border-rehub-100 px-3 py-2 dark:border-white/10">
                        <p className="truncate text-sm font-medium text-rehub-950 dark:text-rehub-100">{session.user?.email}</p>
                      </div>
                      <Link
                        href={ROUTES.dashboard}
                        onClick={() => setUserMenuOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rehub-900 transition-colors hover:bg-rehub-50 dark:text-rehub-100 dark:hover:bg-white/5"
                      >
                        <ArrowRight className="h-4 w-4 text-rehub-600" />
                        {tHeader("goToApp")}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        {tHeader("signOut")}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-rehub-900/80 transition-colors hover:bg-rehub-50 hover:text-rehub-700 dark:text-rehub-100/80 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {tHeader("signIn")}
              </Link>
              <Link
                href={ROUTES.login}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-rehub-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rehub-800 dark:bg-rehub-500 dark:hover:bg-rehub-400"
              >
                {tHeader("getStarted")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-rehub-900 transition-colors hover:bg-rehub-50 dark:text-rehub-100 dark:hover:bg-white/10"
            aria-label={tHeader("menuAria")}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-rehub-100 bg-white/95 p-3 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-rehub-950/95 md:hidden"
          >
            <div className="space-y-1">
              {NAV_KEYS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-4 py-2.5 font-medium text-rehub-900 transition-colors hover:bg-rehub-50 dark:text-rehub-100 dark:hover:bg-white/5"
                >
                  {tNav(link.key)}
                </a>
              ))}
            </div>
            <div className="mt-2 border-t border-rehub-100 pt-2 dark:border-white/10">
              {session ? (
                <>
                  <Link
                    href={ROUTES.dashboard}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-4 py-2.5 font-medium text-rehub-700 dark:text-rehub-300"
                  >
                    {tHeader("goToApp")}
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/", redirect: true });
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left font-medium text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    {tHeader("signOut")}
                  </button>
                </>
              ) : (
                <Link
                  href={ROUTES.login}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rehub-700 px-4 py-3 font-semibold text-white dark:bg-rehub-500"
                >
                  {tHeader("getStarted")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
