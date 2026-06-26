"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-rehub-900/70 transition-colors hover:bg-rehub-50 hover:text-rehub-700 dark:text-rehub-100/70 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rehub-600",
        className
      )}
    >
      {/* render a stable icon until mounted to avoid hydration mismatch */}
      <Sun className={cn("h-[18px] w-[18px]", mounted && isDark ? "block" : "hidden")} />
      <Moon className={cn("h-[18px] w-[18px]", !mounted || !isDark ? "block" : "hidden")} />
    </button>
  );
}
