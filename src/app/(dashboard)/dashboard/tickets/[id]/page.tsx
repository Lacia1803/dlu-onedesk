import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { format } from "date-fns";
import Link from "next/link";
import { TicketActionsMenu } from "@/components/tickets/ticket-actions-menu";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { name: true, id: true } },
      assignee: { select: { name: true, id: true } },
      device: true,
      comments: { 
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" }
      },
    }
  });

  if (!ticket) return notFound();

  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  if (!isCreator && !isTech) {
    return notFound();
  }

  const technicians = isTech ? await db.user.findMany({
    where: { role: { in: ["ADMIN", "TECHNICIAN"] } },
    select: { id: true, name: true }
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-muted-foreground">#{ticket.id.slice(-6).toUpperCase()}</span>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
        </div>
        
        {/* ACTION MENU PLACEHOLDER */}
        <TicketActionsMenu ticket={ticket} technicians={technicians} isTech={isTech} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b pb-4">
              <div>
                <p className="text-muted-foreground mb-1">Người tạo</p>
                <p className="font-medium">{ticket.creator.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Người xử lý</p>
                <p className="font-medium">{ticket.assignee?.name || "Chưa phân công"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Danh mục</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Ngày tạo</p>
                <p className="font-medium">{format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>

            {ticket.deviceId && ticket.device && (
              <div className="bg-muted/50 p-3 rounded-md border flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground mr-2">Thiết bị liên quan:</span>
                  <Link href={`/dashboard/devices/${ticket.deviceId}`} className="font-medium text-primary hover:underline">
                    {ticket.device.name} ({ticket.device.qrCode})
                  </Link>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Mô tả chi tiết:</h3>
              <div className="whitespace-pre-wrap text-sm text-foreground/90 p-4 bg-muted/30 rounded-md border">
                {ticket.description}
              </div>
            </div>
            
            {(ticket.resolvedAt || ticket.closedAt) && (
              <div className="text-sm text-muted-foreground pt-4 border-t flex gap-4">
                {ticket.resolvedAt && <p>Xử lý lúc: {format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm")}</p>}
                {ticket.closedAt && <p>Đóng lúc: {format(new Date(ticket.closedAt), "dd/MM/yyyy HH:mm")}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 h-[600px]">
          <TicketComments ticketId={ticket.id} comments={ticket.comments} currentUserId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
