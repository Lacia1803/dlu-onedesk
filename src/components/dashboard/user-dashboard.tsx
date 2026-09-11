import { getUserStats } from "@/app/actions/dashboard-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TicketStatusBadge } from "@/components/tickets/status-badge";
import Link from "next/link";
import { format } from "date-fns";

export async function UserDashboard() {
  const stats = await getUserStats();

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">▶</span> SYSTEM.USER_OVERVIEW
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Ticket của tôi" value={stats.totalMyTickets} />
        <StatCard title="Đang xử lý" value={stats.myOpenTickets} />
        <StatCard title="Đã hoàn thành" value={stats.myResolvedTickets} />
      </div>

      <div className="border rounded-sm bg-card p-5">
        <h3 className="border-b pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">▶</span> TICKETS.MY_RECENT
        </h3>
        <div className="divide-y divide-border pt-2">
          {stats.recentTickets.length === 0 ? (
            <p className="py-4 font-mono text-sm text-muted-foreground">
              {"// Bạn chưa tạo báo cáo sự cố nào."}
            </p>
          ) : (
            stats.recentTickets.map((ticket) => (
              <div key={ticket.id} className="py-3 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {ticket.title}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    created {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
