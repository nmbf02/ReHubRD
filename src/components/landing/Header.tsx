"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#problema", label: "El Problema" },
  { href: "#solucion", label: "La Solución" },
  { href: "#funcionamiento", label: "Cómo Funciona" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rehub-light/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-rehub-primary group-hover:text-rehub-secondary transition-colors">
              ReHub
            </span>
            <span className="text-xs text-rehub-dark/70 hidden sm:inline">
              Centro de Recuperación
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-rehub-dark hover:text-rehub-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            {status === "loading" ? (
              <div className="w-20 h-9 bg-rehub-light/50 rounded-lg animate-pulse" />
            ) : session ? (
              <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-rehub-dark hover:text-rehub-primary transition-colors"
              >
                Ir al sistema
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-rehub-light/50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-rehub-primary/20 flex items-center justify-center text-rehub-primary font-semibold text-sm">
                    {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "?"}
                  </span>
                  <span className="text-sm font-medium text-rehub-dark max-w-[100px] truncate">
                    {session.user?.name ?? session.user?.email}
                  </span>
                  <svg
                    className="w-4 h-4 text-rehub-dark/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
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
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg border border-rehub-light/50 z-50"
                      >
                        <div className="px-4 py-2 border-b border-rehub-light/50">
                          <p className="text-sm font-medium text-rehub-dark truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-rehub-dark hover:bg-rehub-light/50"
                        >
                          Ir al sistema
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Cerrar sesión
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-rehub-dark hover:text-rehub-primary transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-rehub-primary text-white rounded-lg font-medium hover:bg-rehub-secondary transition-colors"
                >
                  Comenzar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-rehub-dark hover:bg-rehub-light/50"
            aria-label="Menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-rehub-dark hover:text-rehub-primary"
                  >
                    {link.label}
                  </a>
                ))}
                {session ? (
                  <div className="pt-4 border-t border-rehub-light/50">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-rehub-primary font-medium"
                    >
                      Ir al sistema
                    </Link>
                    <p className="text-sm text-rehub-dark/70 mb-2 truncate">
                      {session.user?.email}
                    </p>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/", redirect: true });
                        setIsOpen(false);
                      }}
                      className="block w-full py-2 text-left text-red-600 font-medium"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 mt-4 text-center bg-rehub-primary text-white rounded-lg font-medium"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
