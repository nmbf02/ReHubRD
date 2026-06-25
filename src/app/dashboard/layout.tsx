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
    <div className="relative min-h-screen bg-rehub-50/40">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-grid-rehub bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />
      <DashboardNav user={session.user} />
      <main className="relative lg:pl-64 pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
