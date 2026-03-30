import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SeguimientoView } from "@/components/dashboard/FollowupView";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function SeguimientoPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.followup");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.followup));
  }

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">{t("title")}</h1>
      <p className="text-rehub-dark/70 mb-8">{t("description")}</p>
      <SeguimientoView userId={session.user.id ?? null} />
    </div>
  );
}
