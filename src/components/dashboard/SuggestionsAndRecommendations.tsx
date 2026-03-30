"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconRefresh, IconClipboard, IconCalendar } from "@/components/ui/Icons";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";

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
    <section className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-rehub-dark">{t("title")}</h3>
        <p className="text-xs text-rehub-dark/60">{t("hint")}</p>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sugerencias.map((s) => (
          <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-rehub-primary/10 text-rehub-primary">
              {s.Icon ? <s.Icon className="w-4 h-4" /> : null}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-rehub-dark">{s.label}</p>
              <p className="text-xs text-rehub-dark/60">{t("rowHint")}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scheduleQuick(s.label, s.href, 10000)}
                className="text-xs px-3 py-1 bg-rehub-primary/10 text-rehub-primary rounded-md"
              >
                {t("remind10s")}
              </button>
              <button
                onClick={() => scheduleQuick(s.label, s.href, 60 * 60 * 1000)}
                className="text-xs px-3 py-1 bg-slate-100 rounded-md"
              >
                {t("remind1h")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {recordatorios.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-rehub-dark/80 mb-2">{t("scheduledTitle")}</h4>
          <ul className="space-y-2">
            {recordatorios.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-rehub-dark">{r.label}</p>
                  <p className="text-xs text-rehub-dark/60">{new Date(r.when).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.href && (
                    <Link href={r.href} className="text-xs text-rehub-primary underline">
                      {t("go")}
                    </Link>
                  )}
                  <button onClick={() => removeReminder(r.id)} className="text-xs text-red-600">{t("cancel")}</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
