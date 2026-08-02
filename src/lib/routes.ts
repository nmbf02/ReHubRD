/** Dashboard URL paths (English segments, match `src/app/dashboard/*`). */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  account: "/dashboard/account",
  followup: "/dashboard/followup",
  plan: "/dashboard/plan",
  resources: "/dashboard/resources",
  care: "/dashboard/care",
  intake: "/dashboard/intake",

  // Los seis módulos funcionales de la tesis (BR-09). El orden es el del
  // recorrido, no el alfabético.
  medications: "/dashboard/medications",
  appointments: "/dashboard/appointments",
  paperwork: "/dashboard/paperwork",
  emotional: "/dashboard/emotional",
  progress: "/dashboard/progress",
  reintegration: "/dashboard/reintegration",

  // Panel del profesional de salud (BR-11, BR-12).
  alerts: "/dashboard/alerts",
  patients: "/dashboard/patients",
  agenda: "/dashboard/agenda",

  // Panel institucional: ARS, empresa o centro (BR-07).
  institution: "/dashboard/institution",
  population: "/dashboard/population",
} as const;

/** `/dashboard/resources?guia=…` */
export function hrefResourcesGuide(guideId: string): string {
  return `${ROUTES.resources}?guia=${guideId}`;
}

/** `/dashboard/resources#…` */
export function hrefResourcesHash(fragment: string): string {
  return `${ROUTES.resources}#${fragment}`;
}

/** NextAuth-style return URL after login */
export function hrefLoginCallback(returnPath: string): string {
  return `/login?callbackUrl=${encodeURIComponent(returnPath)}`;
}
