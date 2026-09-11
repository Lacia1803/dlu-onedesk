import { getAllMaintenanceLogs } from "@/app/actions/maintenance-actions";
import { getTicketsForTechnician } from "@/app/actions/ticket-actions";
import { MaintenanceDashboardClient, type TicketItem } from "./maintenance-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const session = await getServerSession(authOptions);
  const isTech = session?.user?.role === "ADMIN" || session?.user?.role === "TECHNICIAN";
  const logs = await getAllMaintenanceLogs();

  // Active tickets for the logged-in technician
  let myTickets: Awaited<ReturnType<typeof getTicketsForTechnician>> = {
    success: false,
    tickets: [],
  };
  if (isTech && session?.user?.id) {
    myTickets = await getTicketsForTechnician(session.user.id);
  }

  const validTickets = myTickets.tickets || [];
  const scheduledTickets = validTickets.filter((t) => t.scheduledAt);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lịch bảo trì</h1>
        <p className="text-sm text-muted-foreground">
          Xem toàn bộ lịch sử bảo trì thiết bị theo tháng. Kéo hoặc chạm chọn ticket để lên lịch bảo trì trên mọi thiết bị.
        </p>
      </div>

      <MaintenanceDashboardClient
        isTech={isTech}
        logs={logs}
        myTickets={validTickets as unknown as TicketItem[]}
        scheduledTickets={scheduledTickets as unknown as TicketItem[]}
      />
    </div>
  );
}
