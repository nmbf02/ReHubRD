import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(hrefLoginCallback(ROUTES.dashboard));
  }

  return (
    <div className="min-h-screen bg-rehub-light/20">
      <DashboardNav user={session.user} />
      <main className="lg:pl-64 pt-16">{children}</main>
    </div>
  );
}
