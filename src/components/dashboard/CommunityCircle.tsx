"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Hand, Check, Sparkles } from "lucide-react";
import type { CommunityMember } from "@/lib/community";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-rehub-600",
  "bg-teal-600",
  "bg-emerald-600",
  "bg-cyan-700",
  "bg-rehub-700",
  "bg-teal-700",
];

function toneFor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_TONES[code % AVATAR_TONES.length];
}

function MemberCard({
  member,
  greeted,
  onGreet,
  greetLabel,
  greetedLabel,
}: {
  member: CommunityMember;
  greeted: boolean;
  onGreet: () => void;
  greetLabel: string;
  greetedLabel: string;
}) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold text-white",
            toneFor(member.name)
          )}
        >
          {member.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-rehub-950">{member.name}</p>
          <p className="text-xs text-rehub-900/45">Miembro del círculo</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-rehub-900/70">
        {member.situation}
      </p>
      <button
        type="button"
        onClick={onGreet}
        disabled={greeted}
        className={cn(
          "mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
          greeted
            ? "cursor-default bg-rehub-50 text-rehub-700"
            : "bg-rehub-100 text-rehub-700 hover:bg-rehub-200"
        )}
      >
        {greeted ? (
          <>
            <Check className="h-4 w-4" /> {greetedLabel}
          </>
        ) : (
          <>
            <Hand className="h-4 w-4" /> {greetLabel}
          </>
        )}
      </button>
    </div>
  );
}

export function CommunityCircle({
  members,
  initialVisible,
}: {
  members: CommunityMember[];
  initialVisible: boolean;
}) {
  const t = useTranslations("dashboard.community");
  const [visible, setVisible] = useState(initialVisible);
  const [saving, setSaving] = useState(false);
  const [greeted, setGreeted] = useState<Record<string, boolean>>({});

  async function toggleVisibility() {
    const next = !visible;
    setVisible(next); // optimistic
    setSaving(true);
    try {
      await fetch("/api/community/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: next }),
      });
    } catch {
      setVisible(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  }

  const hasMembers = members.length > 0;
  // Duplicate the list so the marquee loops seamlessly.
  const track = hasMembers ? [...members, ...members] : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-rehub-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rehub-700 text-white">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-rehub-950">{t("title")}</h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">{t("subtitle")}</p>
          </div>
        </div>

        {/* Opt-in toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          onClick={toggleVisibility}
          disabled={saving}
          className="group flex shrink-0 items-center gap-3 rounded-xl border border-border bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-rehub-50/60 disabled:opacity-60"
        >
          <span
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              visible ? "bg-rehub-600" : "bg-rehub-200"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                visible ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-rehub-950">{t("shareLabel")}</span>
            <span className="block text-xs text-rehub-900/55">{t("shareHint")}</span>
          </span>
        </button>
      </div>

      {hasMembers ? (
        <div className="group/marquee relative py-6">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

          <div className="overflow-hidden motion-reduce:overflow-x-auto">
            <div className="flex w-max gap-4 px-6 animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
              {track.map((member, i) => (
                <MemberCard
                  key={`${member.id}-${i}`}
                  member={member}
                  greeted={!!greeted[member.id]}
                  onGreet={() => setGreeted((g) => ({ ...g, [member.id]: true }))}
                  greetLabel={t("greet")}
                  greetedLabel={t("greeted")}
                />
              ))}
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 px-6 text-center text-xs text-rehub-900/45">
            <Sparkles className="h-3.5 w-3.5" />
            {t("connectNote")}
          </p>
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <h3 className="font-semibold text-rehub-950">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-rehub-900/60">{t("emptyBody")}</p>
        </div>
      )}
    </section>
  );
}
