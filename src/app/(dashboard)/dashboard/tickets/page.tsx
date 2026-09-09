import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";
import { format } from "date-fns";
import { TicketStatusFilter } from "@/components/tickets/ticket-status-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const isUser = role === "USER";

  const { q, status, priority } = await searchParams;
  const keyword = q?.trim();

  const where: any = isUser ? { creatorId: session.user.id } : {};

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { id: { contains: keyword, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tickets = await db.ticket.findMany({
    where,
    include: {
      creator: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary">▶</span> TICKETS.QUEUE
          </h1>
          <p className="mt-1 text-lg font-semibold">{isUser ? "Ticket của tôi" : "Quản lý Tickets"}</p>
        </div>
        <Link href="/dashboard/tickets/new" className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Tạo Ticket
        </Link>
      </div>

      <TicketStatusFilter currentStatus={status} currentPriority={priority} keyword={keyword} />

      <div className="rounded-sm border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mức độ</TableHead>
              {!isUser && <TableHead>Người tạo</TableHead>}
              <TableHead>Người xử lý</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isUser ? 6 : 7} className="text-center py-6 text-muted-foreground">
                  Không có dữ liệu ticket
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{ticket.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline text-primary">
                      {ticket.title}
                    </Link>
                  </TableCell>
                  <TableCell><TicketStatusBadge status={ticket.status} /></TableCell>
                  <TableCell><TicketPriorityBadge priority={ticket.priority} /></TableCell>
                  {!isUser && <TableCell>{ticket.creator.name}</TableCell>}
                  <TableCell>{ticket.assignee?.name || <span className="text-muted-foreground italic">Chưa phân công</span>}</TableCell>
                  <TableCell>{format(new Date(ticket.createdAt), "dd/MM/yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
