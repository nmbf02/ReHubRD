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
        "mb-8 rounded-xl border border-border bg-white p-6 shadow-soft",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rehub-700 text-white">
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
