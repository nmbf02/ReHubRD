import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/dashboard/AccountForm";
import { Suspense } from "react";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

type userDataProps = {
  id: string;
  email: string | null;
  name: string | null;
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard.pages.account");

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.account));
  }

  const userData: userDataProps = {
    id: session.user.id ?? "",
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8 min-h-[50vh]">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">{t("title")}</h1>
      <p className="text-rehub-dark/70 mb-8">{t("description")}</p>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AccountForm user={userData} />
      </Suspense>
    </div>
  );
}
