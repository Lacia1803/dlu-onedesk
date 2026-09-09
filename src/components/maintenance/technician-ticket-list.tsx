import Link from "next/link";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";

interface TechnicianTicket {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_PARTS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: Date;
  device: { name: string } | null;
}

export function TechnicianTicketList({ tickets }: { tickets: TechnicianTicket[] }) {
  return (
    <div className="border rounded-sm bg-card p-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
        <span className="text-primary">▶</span> TICKETS.CỦA TÔI ({tickets.length})
      </h2>
      <ul className="divide-y divide-border">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="py-2 flex items-center justify-between gap-4"
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData("application/json", JSON.stringify({ id: t.id }));
            }}
          >
            <Link
              href={`/dashboard/tickets/${t.id}`}
              className="min-w-0 flex-1 truncate text-sm font-medium text-primary hover:underline"
            >
              #{t.id.slice(-6).toUpperCase()} — {t.title}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <TicketStatusBadge status={t.status} />
              <TicketPriorityBadge priority={t.priority} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
