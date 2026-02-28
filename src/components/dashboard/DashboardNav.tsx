"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { IconHome, IconUser, IconClipboard, IconRefresh, IconBook, IconSettings } from "@/components/ui/Icons";
import { getDatosCuenta } from "@/lib/cuenta-store";

const navItems = [
  { href: "/dashboard", label: "Inicio", Icon: IconHome },
  { href: "/dashboard/perfil", label: "Mi perfil", Icon: IconUser },
  { href: "/dashboard/plan", label: "Mi plan", Icon: IconClipboard },
  { href: "/dashboard/seguimiento", label: "Seguimiento", Icon: IconRefresh },
  { href: "/dashboard/recursos", label: "Recursos", Icon: IconBook },
  { href: "/dashboard/cuenta", label: "Cuenta", Icon: IconSettings },
];

interface Props {
  user: Session["user"];
}

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const [nombreMostrar, setNombreMostrar] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const datos = getDatosCuenta(user?.id);
      setNombreMostrar(datos?.nombreMostrar ?? null);
    };
    update();
    window.addEventListener("rehub-cuenta-updated", update);
    return () => window.removeEventListener("rehub-cuenta-updated", update);
  }, [user?.id]);

  const displayName = nombreMostrar || user?.name || user?.email;

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-rehub-light/50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-rehub-primary">
          ReHub
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/cuenta"
            className="text-sm text-rehub-dark/70 truncate max-w-[120px] hover:text-rehub-primary"
          >
            {displayName ?? "Usuario"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="text-sm text-red-600 hover:underline"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-rehub-light/50 flex-col z-40 overflow-hidden">
        <div className="p-6 border-b border-rehub-light/50 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-rehub-primary">ReHub</span>
          </Link>
          <p className="text-xs text-rehub-dark/60 mt-1">Centro de Recuperación</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-rehub-primary text-white [&_svg]:text-white"
                    : "text-rehub-dark hover:bg-rehub-light/50"
                }`}
              >
                <item.Icon />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-rehub-light/50 shrink-0">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-rehub-dark truncate">
              {displayName ?? "Usuario"}
            </p>
            <p className="text-xs text-rehub-dark/60 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile nav - bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rehub-light/50 flex justify-around py-2 safe-area-pb overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[56px] shrink-0 ${
                isActive ? "text-rehub-primary [&_svg]:text-rehub-primary" : "text-rehub-dark/70"
              }`}
            >
              <item.Icon />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
