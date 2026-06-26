"use client";

import { useState } from "react";
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
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow",
        scrolled ? "border-border shadow-soft" : "border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rehub-700 text-white">
            <HeartPulse className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-rehub-950">
              {common("brand")}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-rehub-900/50 sm:inline">
              {common("tagline")}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_KEYS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-rehub-900/70 transition-colors hover:text-rehub-700"
            >
              {tNav(link.key)}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-rehub-100/70" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-white py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-rehub-50/70"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rehub-700 text-sm font-semibold text-white">
                  {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="max-w-[110px] truncate text-sm font-medium text-rehub-900">
                  {session.user?.name ?? session.user?.email}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-rehub-900/45 transition-transform", userMenuOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-white p-1.5 shadow-elevated"
                    >
                      <div className="border-b border-border px-3 py-2">
                        <p className="truncate text-sm font-medium text-rehub-950">{session.user?.email}</p>
                      </div>
                      <Link
                        href={ROUTES.dashboard}
                        onClick={() => setUserMenuOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-rehub-900 transition-colors hover:bg-rehub-50"
                      >
                        <ArrowRight className="h-4 w-4 text-rehub-600" />
                        {tHeader("goToApp")}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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
                className="text-sm font-medium text-rehub-900/70 transition-colors hover:text-rehub-700"
              >
                {tHeader("signIn")}
              </Link>
              <Link
                href={ROUTES.login}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rehub-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rehub-800"
              >
                {tHeader("getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-rehub-900 transition-colors hover:bg-rehub-50 md:hidden"
          aria-label={tHeader("menuAria")}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_KEYS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2.5 font-medium text-rehub-900 transition-colors hover:bg-rehub-50"
                >
                  {tNav(link.key)}
                </a>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                {session ? (
                  <>
                    <Link
                      href={ROUTES.dashboard}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-2.5 font-medium text-rehub-700"
                    >
                      {tHeader("goToApp")}
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/", redirect: true });
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-medium text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      {tHeader("signOut")}
                    </button>
                  </>
                ) : (
                  <Link
                    href={ROUTES.login}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-rehub-700 px-4 py-3 font-semibold text-white"
                  >
                    {tHeader("getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
