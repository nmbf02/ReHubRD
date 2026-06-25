import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Consistent premium header for every dashboard route — icon chip + title +
 * description on a soft gradient panel. Presentational + server-friendly.
 */
export function DashboardPageHeader({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/70 p-6 shadow-soft",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rehub-100/60 blur-2xl" />
      <div className="relative flex items-start gap-4">
        {Icon ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-rehub-950 lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-pretty leading-relaxed text-rehub-900/65">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
