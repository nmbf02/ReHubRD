"use client";

/**
 * Cambio de perfil. Es una simulación explícita y se presenta como tal: en
 * producción cada rol entra con su propia cuenta, aquí se alterna para poder
 * enseñar los tres productos que la tesis vende (ADR 0002).
 */

import { useRouter } from "next/navigation";
import { User, Stethoscope, Building2 } from "lucide-react";
import {
  type RehubRole,
  type InstitutionKind,
  type RoleState,
  INSTITUTION_PROFILE,
  ROLE_LABEL,
  saveRole,
} from "@/lib/roles";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ role: RehubRole; Icon: typeof User; landing: string }> = [
  { role: "paciente", Icon: User, landing: ROUTES.dashboard },
  { role: "medico", Icon: Stethoscope, landing: ROUTES.alerts },
  { role: "institucion", Icon: Building2, landing: ROUTES.institution },
];

interface Props {
  state: RoleState;
  userId?: string | null;
  onChange: (next: RoleState) => void;
}

export function RoleSwitcher({ state, userId, onChange }: Props) {
  const router = useRouter();

  const switchTo = (role: RehubRole, landing: string) => {
    const next: RoleState = { ...state, role };
    saveRole(next, userId);
    onChange(next);
    router.push(landing);
  };

  const switchInstitution = (institution: InstitutionKind) => {
    const next: RoleState = { ...state, institution };
    saveRole(next, userId);
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-rehub-100 bg-rehub-50/50 p-2.5">
      <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-rehub-900/45">
        Estás viendo ReHub como
      </p>
      <div className="grid grid-cols-3 gap-1">
        {OPTIONS.map(({ role, Icon, landing }) => {
          const isActive = state.role === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => switchTo(role, landing)}
              aria-pressed={isActive}
              title={ROLE_LABEL[role]}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium leading-tight transition-all",
                isActive
                  ? "bg-white text-rehub-800 shadow-soft ring-1 ring-rehub-200"
                  : "text-rehub-900/55 hover:bg-white/60 hover:text-rehub-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-center">
                {role === "medico" ? "Médico" : role === "institucion" ? "Institución" : "Paciente"}
              </span>
            </button>
          );
        })}
      </div>

      {state.role === "institucion" && (
        <select
          value={state.institution}
          onChange={(event) => switchInstitution(event.target.value as InstitutionKind)}
          aria-label="Tipo de institución"
          className="mt-2 w-full rounded-lg border border-rehub-200 bg-white px-2 py-1.5 text-xs font-medium text-rehub-900 outline-none focus:border-rehub-400"
        >
          {(Object.keys(INSTITUTION_PROFILE) as InstitutionKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {INSTITUTION_PROFILE[kind].label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
