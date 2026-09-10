import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import { TicketStatusFilter } from "@/components/tickets/ticket-status-filter";
import { BulkTicketTable } from "@/components/tickets/bulk-ticket-table";

import { PaginationControls } from "@/components/ui/pagination-controls";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  const isUser = role === "USER";

  const { q, status, priority, page: pageParam } = await searchParams;
  const keyword = q?.trim();
  const page = Math.max(1, parseInt(pageParam || "1", 10));

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

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: {
        creator: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.ticket.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary">▶</span> TICKETS.QUEUE
          </h1>
          <p className="mt-1 text-lg font-semibold">
            {isUser ? "Ticket của tôi" : "Quản lý Tickets"}
          </p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo Ticket
        </Link>
      </div>

      <TicketStatusFilter currentStatus={status} currentPriority={priority} keyword={keyword} />

      <BulkTicketTable tickets={tickets} isUser={isUser} />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl="/dashboard/tickets"
        searchParams={{ q, status, priority }}
      />
    </div>
  );
}
