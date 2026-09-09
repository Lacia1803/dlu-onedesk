import { getUserStats } from "@/app/actions/dashboard-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";
import { Ticket, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export async function UserDashboard() {
  const stats = await getUserStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Ticket của tôi" 
          value={stats.totalMyTickets} 
          icon={<Ticket className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Đang xử lý" 
          value={stats.myOpenTickets} 
          icon={<Clock className="h-4 w-4 text-orange-500" />} 
        />
        <StatCard 
          title="Đã hoàn thành" 
          value={stats.myResolvedTickets} 
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} 
        />
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Ticket gần đây của bạn</h3>
        <div className="divide-y">
          {stats.recentTickets.length === 0 ? (
            <p className="text-muted-foreground py-4">Bạn chưa tạo báo cáo sự cố nào.</p>
          ) : (
            stats.recentTickets.map(ticket => (
              <div key={ticket.id} className="py-3 flex justify-between items-start">
                <div>
                  <Link href={`/dashboard/tickets/${ticket.id}`} className="font-medium hover:underline text-primary">
                    {ticket.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tạo ngày: {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
