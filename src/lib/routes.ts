/** Dashboard URL paths (English segments, match `src/app/dashboard/*`). */
export const ROUTES = {
  dashboard: "/dashboard",
  profile: "/dashboard/profile",
  account: "/dashboard/account",
  followup: "/dashboard/followup",
  plan: "/dashboard/plan",
  resources: "/dashboard/resources",
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
