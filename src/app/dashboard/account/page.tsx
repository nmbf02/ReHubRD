import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { AccountForm } from "@/components/dashboard/AccountForm";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
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
    <div className="mx-auto min-h-[50vh] max-w-5xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
      <DashboardPageHeader title={t("title")} description={t("description")} icon={Settings} />
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rehub-500 border-t-transparent" />
          </div>
        }
      >
        <AccountForm user={userData} />
      </Suspense>
    </div>
  );
}
