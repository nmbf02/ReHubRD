"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RefreshCw, ClipboardList, CalendarDays, Bell, BellOff, Clock, ExternalLink } from "lucide-react";
import { IconRefresh, IconClipboard, IconCalendar } from "@/components/ui/Icons";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface Item {
  label: string;
  href?: string;
  Icon?: (props: { className?: string }) => JSX.Element;
}

interface Props {
  progreso: number;
  userId?: string | null;
  items?: Item[];
}

type Recordatorio = {
  id: string;
  label: string;
  href?: string;
  when: number;
  createdAt: number;
};

function storageKey(userId?: string | null) {
  return `rehub-recordatorios${userId ? `-${userId}` : ""}`;
}

function notify(title: string, body?: string, href?: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      const n = new Notification(title, { body });
      if (href) n.onclick = () => window.open(href, "_blank");
    } else {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification(title, { body });
        else alert(`${title}\n${body ?? ""}`);
      });
    }
  } else alert(`${title}\n${body ?? ""}`);
}

export default function SugerenciasRecordatorios({ progreso, userId, items }: Props) {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const timers = useRef<Record<string, number>>({});
  const t = useTranslations("dashboard.suggestions");
  const tNav = useTranslations("dashboard.nav");

  const defaultItems: Item[] = useMemo(
    () => [
      { label: tNav("profile"), href: ROUTES.profile, Icon: IconClipboard },
      { label: tNav("plan"), href: ROUTES.plan, Icon: IconClipboard },
      { label: tNav("followup"), href: ROUTES.followup, Icon: IconRefresh },
      { label: tNav("resources"), href: ROUTES.resources, Icon: IconCalendar },
      { label: t("freeHelp"), href: hrefResourcesHash("ayuda-gratuita"), Icon: IconCalendar },
    ],
    [t, tNav]
  );

  const itemsToShow = (propsItems?: Item[]) => {
    if (propsItems && propsItems.length > 0) return propsItems.slice(0, 5);
    if (progreso < 25) return defaultItems.slice(0, 5);
    if (progreso < 75) return defaultItems.slice(0, 5);
    return defaultItems.slice(0, 5);
  };

  const sugerencias = itemsToShow(items);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(userId ?? undefined));
      const list: Recordatorio[] = raw ? JSON.parse(raw) : [];
      setRecordatorios(list.filter((r) => r.when > Date.now()));
    } catch {
      setRecordatorios([]);
    }
  }, [userId]);

  useEffect(() => {
    for (const r of recordatorios) {
      if (timers.current[r.id]) continue;
      const delay = Math.max(0, r.when - Date.now());
      const reminderLabel = r.label;
      const reminderHref = r.href;
      const notifyTitleText = t("notifyTitle", { label: reminderLabel });
      const notifyBodyText = t("notifyBody");
      const tUserId = userId;
      const tId = r.id;
      const timeoutId = window.setTimeout(() => {
        notify(notifyTitleText, notifyBodyText, reminderHref);
        setRecordatorios((prev) => prev.filter((x) => x.id !== tId));
        const stored = sessionStorage.getItem(storageKey(tUserId ?? undefined));
        const list: Recordatorio[] = stored ? JSON.parse(stored) : [];
        sessionStorage.setItem(
          storageKey(tUserId ?? undefined),
          JSON.stringify(list.filter((x) => x.id !== tId))
        );
        delete timers.current[tId];
      }, delay);
      timers.current[r.id] = timeoutId;
    }

    return () => {
      Object.values(timers.current).forEach((id) => clearTimeout(id));
      timers.current = {};
    };
  }, [recordatorios, userId, t]);

  function scheduleQuick(label: string, href?: string, msDelay = 10000) {
    const when = Date.now() + msDelay;
    const rec: Recordatorio = {
      id: Math.random().toString(36).slice(2),
      label,
      href,
      when,
      createdAt: Date.now(),
    };
    const next = [...recordatorios, rec];
    setRecordatorios(next);
    sessionStorage.setItem(storageKey(userId ?? undefined), JSON.stringify(next));
  }

  function removeReminder(id: string) {
    setRecordatorios((prev) => prev.filter((r) => r.id !== id));
    const stored = sessionStorage.getItem(storageKey(userId ?? undefined));
    const list: Recordatorio[] = stored ? JSON.parse(stored) : [];
    sessionStorage.setItem(storageKey(userId ?? undefined), JSON.stringify(list.filter((x) => x.id !== id)));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }

  return (
    <Reveal>
      <section className="mt-6 rounded-2xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 p-5 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <Bell className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-rehub-950">{t("title")}</h3>
          </div>
          <p className="text-xs text-rehub-900/55">{t("hint")}</p>
        </div>

        {/* Suggestions grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sugerencias.map((s) => (
            <StaggerItem key={s.label}>
              <div className="group flex items-center gap-3 rounded-xl border border-rehub-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-rehub-200 hover:shadow-elevated">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 transition-colors group-hover:bg-rehub-600 group-hover:text-white">
                  {s.Icon ? <s.Icon className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-rehub-950">{s.label}</p>
                  <p className="text-xs text-rehub-900/55">{t("rowHint")}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => scheduleQuick(s.label, s.href, 10000)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rehub-600 px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg disabled:opacity-60"
                  >
                    <Clock className="h-3 w-3" />
                    {t("remind10s")}
                  </button>
                  <button
                    onClick={() => scheduleQuick(s.label, s.href, 60 * 60 * 1000)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 bg-white px-3 py-1.5 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
                  >
                    <CalendarDays className="h-3 w-3" />
                    {t("remind1h")}
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Scheduled reminders */}
        {recordatorios.length > 0 && (
          <div className="mt-5 rounded-xl border border-rehub-100 bg-rehub-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <h4 className="text-sm font-semibold text-rehub-950">{t("scheduledTitle")}</h4>
              <span className="ml-auto rounded-full border border-rehub-200 bg-rehub-50 px-2.5 py-0.5 text-xs font-semibold text-rehub-700">
                {recordatorios.length}
              </span>
            </div>
            <ul className="space-y-2">
              {recordatorios.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-rehub-100 bg-white px-4 py-3 transition-all hover:border-rehub-200 hover:shadow-elevated"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-rehub-950">{r.label}</p>
                      <p className="text-xs text-rehub-900/55">{new Date(r.when).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    {r.href && (
                      <Link
                        href={r.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 transition-colors hover:text-rehub-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("go")}
                      </Link>
                    )}
                    <button
                      onClick={() => removeReminder(r.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100"
                    >
                      <BellOff className="h-3 w-3" />
                      {t("cancel")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </Reveal>
  );
}
