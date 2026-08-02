"use client";

/**
 * El menú ES el recorrido (ADR 0001).
 *
 * Antes era una lista plana de nueve herramientas donde nada indicaba qué va
 * primero ni cuándo se acaba. Ahora el paciente ve un carril con las cuatro
 * etapas —desde el alta médica hasta el alta ReHub—, con los módulos colgando
 * de la etapa en que se activan (BR-03), la etapa actual marcada y las
 * anteriores con su visto.
 *
 * El médico y la institución no ven un menú reordenado: ven otro menú (ADR 0002).
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  Home,
  User,
  Pill,
  CalendarDays,
  FileText,
  HeartPulse,
  TrendingUp,
  Briefcase,
  BookOpen,
  Settings,
  LogOut,
  Check,
  Stethoscope,
  BellRing,
  Users,
  Building2,
  ClipboardList,
  MessageCircleHeart,
  RefreshCw,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { getAccountData } from "@/lib/account-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { getRole, type RoleState, ROLE_TAGLINE, ROLE_UPDATED_EVENT } from "@/lib/roles";
import { usePatientJourney } from "@/hooks/use-patient-journey";
import {
  MODULES,
  STAGES,
  STAGE_ORDER,
  type ModuleId,
  type StageId,
  isModuleActive,
} from "@/lib/journey";

const MODULE_ICON: Record<ModuleId, LucideIcon> = {
  medicamentos: Pill,
  citas: CalendarDays,
  tramites: FileText,
  emocional: HeartPulse,
  progreso: TrendingUp,
  reintegracion: Briefcase,
};

/**
 * Pantallas ya construidas que la tesis no nombra como módulo. No se tiran,
 * pero tampoco compiten con el recorrido: viven en un grupo secundario
 * (ADR 0001, consecuencias). Las cinco etapas tienen que caber en pantalla —
 * si hay que hacer scroll para ver el final del recorrido, el menú deja de
 * comunicar que existe un final.
 */
const SUPPORT_LINKS = [
  { href: ROUTES.profile, label: "Datos de tu alta", Icon: User },
  { href: ROUTES.care, label: "Tu lesión", Icon: ClipboardList },
  { href: ROUTES.followup, label: "Check-in semanal", Icon: RefreshCw },
  { href: ROUTES.resources, label: "Guías y recursos", Icon: BookOpen },
  { href: ROUTES.intake, label: "Cuéntame", Icon: MessageCircleHeart },
];

const DOCTOR_LINKS = [
  { href: ROUTES.alerts, label: "Alertas", Icon: BellRing },
  { href: ROUTES.patients, label: "Mis pacientes", Icon: Users },
  { href: ROUTES.agenda, label: "Agenda", Icon: CalendarDays },
];

const INSTITUTION_LINKS = [
  { href: ROUTES.institution, label: "Indicadores", Icon: TrendingUp },
  { href: ROUTES.population, label: "Población", Icon: Users },
];

interface Props {
  user: Session["user"];
}

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const [roleState, setRoleState] = useState<RoleState>({ role: "paciente", institution: "ars" });
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { journey } = usePatientJourney(user?.id);

  useEffect(() => {
    const sync = () => {
      setRoleState(getRole(user?.id));
      setDisplayName(getAccountData(user?.id)?.showName ?? null);
    };
    sync();
    window.addEventListener(ROLE_UPDATED_EVENT, sync);
    window.addEventListener("rehub-cuenta-updated", sync);
    return () => {
      window.removeEventListener(ROLE_UPDATED_EVENT, sync);
      window.removeEventListener("rehub-cuenta-updated", sync);
    };
  }, [user?.id]);

  const shownName = displayName || user?.name || user?.email;
  const initial = (shownName ?? "?").trim().charAt(0).toUpperCase();
  const stage = journey?.stage ?? "ingreso";

  /** Los módulos ya activos, en orden de recorrido. Alimenta la barra móvil. */
  const activeModules = useMemo(
    () => MODULES.filter((module) => isModuleActive(module, stage)),
    [stage]
  );

  const bottomItems = useMemo(() => {
    if (roleState.role === "medico") {
      return [
        { href: ROUTES.alerts, label: "Alertas", Icon: BellRing },
        { href: ROUTES.patients, label: "Pacientes", Icon: Users },
        { href: ROUTES.agenda, label: "Agenda", Icon: CalendarDays },
        { href: ROUTES.account, label: "Cuenta", Icon: Settings },
      ];
    }
    if (roleState.role === "institucion") {
      return [
        { href: ROUTES.institution, label: "Indicadores", Icon: TrendingUp },
        { href: ROUTES.population, label: "Población", Icon: Users },
        { href: ROUTES.account, label: "Cuenta", Icon: Settings },
      ];
    }
    return [
      { href: ROUTES.dashboard, label: "Hoy", Icon: Home },
      ...activeModules.slice(0, 3).map((module) => ({
        href: module.href,
        label: module.label.split(" ")[0],
        Icon: MODULE_ICON[module.id],
      })),
      { href: ROUTES.account, label: "Cuenta", Icon: Settings },
    ];
  }, [roleState.role, activeModules]);

  return (
    <>
      {/* Barra superior móvil */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-rehub-100 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <BrandMark className="h-9 w-9" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-rehub-950">ReHub</span>
            {roleState.role === "paciente" && journey && (
              <span className="mt-0.5 text-[10px] font-medium text-rehub-700/70">
                Etapa {STAGES[stage].step ?? "✓"} · {STAGES[stage].label}
              </span>
            )}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.account}
            className="max-w-[110px] truncate text-sm font-medium text-rehub-900/70 hover:text-rehub-700"
          >
            {shownName ?? "Tu cuenta"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Barra lateral de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-rehub-100 bg-white/80 backdrop-blur-xl lg:flex">
        <div className="shrink-0 border-b border-rehub-100 px-5 py-4">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-9" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-rehub-950">ReHub</span>
              <span className="mt-1 text-[11px] font-medium text-rehub-700/70">
                {ROLE_TAGLINE[roleState.role]}
              </span>
            </span>
          </Link>
        </div>

        <div className="shrink-0 px-4 pt-4">
          <RoleSwitcher state={roleState} userId={user?.id} onChange={setRoleState} />
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3">
          {roleState.role === "paciente" ? (
            <PatientRail pathname={pathname} stage={stage} journeyReady={Boolean(journey)} />
          ) : (
            <PanelLinks
              pathname={pathname}
              links={roleState.role === "medico" ? DOCTOR_LINKS : INSTITUTION_LINKS}
            />
          )}
        </nav>

        <div className="shrink-0 border-t border-rehub-100 p-4">
          <Link
            href={ROUTES.account}
            className="flex items-center gap-3 rounded-xl bg-rehub-50/70 px-3 py-2.5 transition-colors hover:bg-rehub-100/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-rehub-950">
                {shownName ?? "Tu cuenta"}
              </p>
              <p className="truncate text-xs text-rehub-900/55">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Barra inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-rehub-100 bg-white/90 py-1.5 backdrop-blur-xl lg:hidden">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[52px] flex-col items-center gap-1 rounded-lg px-1 py-1.5 transition-colors",
                isActive ? "text-rehub-700" : "text-rehub-900/50"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-rehub-100 text-rehub-700" : "text-rehub-900/55"
                )}
              >
                <item.Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/** Menú plano para los roles de aliado: su trabajo no es un recorrido. */
function PanelLinks({
  pathname,
  links,
}: {
  pathname: string;
  links: Array<{ href: string; label: string; Icon: LucideIcon }>;
}) {
  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-brand-gradient text-white shadow-glow"
                : "text-rehub-900/75 hover:bg-rehub-50 hover:text-rehub-800"
            )}
          >
            <link.Icon
              className={cn("h-5 w-5", isActive ? "text-white" : "text-rehub-600/80")}
            />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

/**
 * El carril. Un nodo por etapa unido por una línea vertical; bajo la etapa
 * actual cuelgan los módulos ya activos. La lectura de arriba abajo es
 * literalmente el proceso: se sale del hospital arriba y se recibe el alta
 * ReHub abajo.
 *
 * Solo la etapa actual se despliega. Las cinco etapas deben caber sin scroll:
 * un menú donde hay que desplazarse para descubrir que la recuperación termina
 * no comunica que termina, que es justo lo que había que arreglar.
 */
function PatientRail({
  pathname,
  stage,
  journeyReady,
}: {
  pathname: string;
  stage: StageId;
  journeyReady: boolean;
}) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  const activeModules = MODULES.filter((module) => isModuleActive(module, stage));

  return (
    <div className="space-y-1">
      <Link
        href={ROUTES.dashboard}
        className={cn(
          "mb-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
          pathname === ROUTES.dashboard
            ? "bg-brand-gradient text-white shadow-glow"
            : "text-rehub-900/75 hover:bg-rehub-50"
        )}
      >
        <Home className={cn("h-5 w-5", pathname === ROUTES.dashboard ? "text-white" : "text-rehub-600/80")} />
        Dónde estoy hoy
      </Link>

      <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-rehub-900/40">
        Tu recuperación
      </p>

      <ol className="relative">
        {STAGE_ORDER.map((stageId, index) => {
          const stageDef = STAGES[stageId];
          const isDone = journeyReady && index < currentIndex;
          const isCurrent = journeyReady && index === currentIndex;
          const isLast = index === STAGE_ORDER.length - 1;

          return (
            <li key={stageId} className="relative pl-8">
              {/* Línea que une los nodos del carril */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-[13px] top-6 w-px",
                    isDone ? "bg-rehub-300" : "bg-rehub-100"
                  )}
                />
              )}

              <span
                aria-hidden
                className={cn(
                  "absolute left-[6px] top-[7px] flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                  isDone && "border-rehub-500 bg-rehub-500 text-white",
                  isCurrent && "border-rehub-600 bg-white ring-4 ring-rehub-100",
                  !isDone && !isCurrent && "border-rehub-200 bg-white"
                )}
              >
                {isDone && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
                {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-rehub-600" />}
                {isLast && !isDone && !isCurrent && <Flag className="h-2 w-2 text-rehub-300" />}
              </span>

              <p
                className={cn(
                  "flex items-baseline gap-1.5 py-1 text-[13px] font-semibold leading-tight",
                  isCurrent ? "text-rehub-800" : isDone ? "text-rehub-900/70" : "text-rehub-900/40"
                )}
              >
                {stageDef.step !== null && (
                  <span className="tabular-nums opacity-60">{stageDef.step}.</span>
                )}
                {stageDef.label}
                {isCurrent && (
                  <span className="ml-auto shrink-0 rounded-full bg-rehub-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    aquí
                  </span>
                )}
              </p>

              {/* Solo la etapa actual despliega: son los módulos ya activos (BR-03). */}
              {isCurrent && activeModules.length > 0 && (
                <div className="mb-1 space-y-0.5">
                  {activeModules.map((module) => (
                    <RailLink
                      key={module.id}
                      href={module.href}
                      label={module.label}
                      Icon={MODULE_ICON[module.id]}
                      active={pathname === module.href}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="pt-3">
        <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-rehub-900/40">
          Cuando lo necesites
        </p>
        {SUPPORT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-4 py-1.5 text-[13px] transition-all",
              pathname === link.href
                ? "bg-rehub-100 font-semibold text-rehub-800"
                : "text-rehub-900/60 hover:bg-rehub-50 hover:text-rehub-800"
            )}
          >
            <link.Icon className="h-4 w-4 shrink-0 text-rehub-500/70" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RailLink({
  href,
  label,
  Icon,
  active,
  subtle,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg py-1 pl-2 pr-3 text-[13px] transition-all",
        active
          ? "bg-rehub-100 font-semibold text-rehub-800"
          : subtle
            ? "text-rehub-900/50 hover:bg-rehub-50 hover:text-rehub-700"
            : "text-rehub-900/70 hover:bg-rehub-50 hover:text-rehub-800"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-rehub-700" : "text-rehub-500/70")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/** Reexport para las pantallas que quieran el icono del módulo. */
export { MODULE_ICON };
