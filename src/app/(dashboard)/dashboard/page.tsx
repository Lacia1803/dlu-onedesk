import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ExportSnapshot } from "@/components/dashboard/export-snapshot";
import { TechKPIDashboard } from "@/components/dashboard/tech-kpi";
import { FirstLoginBanner } from "@/components/dashboard/first-login-banner";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });

  const isAdminOrTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  return (
    <div className="space-y-4">
      <FirstLoginBanner mustChange={user?.mustChangePassword ?? false} />
      <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
      <ExportSnapshot>
        {isAdminOrTech ? <AdminDashboard /> : <UserDashboard />}
        {isAdminOrTech && <TechKPIDashboard />}
      </ExportSnapshot>
    </div>
  );
}
