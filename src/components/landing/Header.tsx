"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, LogOut, ArrowRight, HeartPulse } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4",
          scrolled
            ? "border-rehub-100 bg-white/80 py-2 shadow-card backdrop-blur-xl"
            : "border-transparent bg-white/40 py-3 backdrop-blur-md"
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow transition-transform group-hover:scale-105">
            <HeartPulse className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-rehub-950">
              {common("brand")}
            </span>
            <span className="hidden text-[11px] font-medium text-rehub-700/70 sm:inline">
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
              className="group relative rounded-lg px-3 py-2 text-sm font-medium text-rehub-900/70 transition-colors hover:text-rehub-700"
            >
              {tNav(link.key)}
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-rehub-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-rehub-100/70" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-rehub-100 bg-white/70 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-rehub-200 hover:bg-rehub-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-sm font-semibold text-white">
                  {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "?"}
                </span>
                <span className="max-w-[110px] truncate text-sm font-medium text-rehub-900">
                  {session.user?.name ?? session.user?.email}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-rehub-700/60 transition-transform",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-rehub-100 bg-white p-1.5 shadow-elevated"
                    >
                      <div className="border-b border-rehub-100/70 px-3 py-2">
                        <p className="truncate text-sm font-medium text-rehub-950">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href={ROUTES.dashboard}
                        onClick={() => setUserMenuOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rehub-900 transition-colors hover:bg-rehub-50"
                      >
                        <ArrowRight className="h-4 w-4 text-rehub-600" />
                        {tHeader("goToApp")}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-rehub-900/80 transition-colors hover:bg-rehub-50 hover:text-rehub-700"
              >
                {tHeader("signIn")}
              </Link>
              <Link
                href={ROUTES.login}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-rehub-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
              >
                {tHeader("getStarted")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl p-2 text-rehub-900 transition-colors hover:bg-rehub-50 md:hidden"
          aria-label={tHeader("menuAria")}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-rehub-100 bg-white/95 p-3 shadow-card backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1">
              {NAV_KEYS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-4 py-2.5 font-medium text-rehub-900 transition-colors hover:bg-rehub-50"
                >
                  {tNav(link.key)}
                </a>
              ))}
            </div>
            <div className="mt-2 border-t border-rehub-100 pt-2">
              {session ? (
                <>
                  <Link
                    href={ROUTES.dashboard}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-4 py-2.5 font-medium text-rehub-700"
                  >
                    {tHeader("goToApp")}
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/", redirect: true });
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left font-medium text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {tHeader("signOut")}
                  </button>
                </>
              ) : (
                <Link
                  href={ROUTES.login}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rehub-600 px-4 py-3 font-semibold text-white shadow-glow"
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
