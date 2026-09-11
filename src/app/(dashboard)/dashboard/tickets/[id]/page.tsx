import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { isOverdue } from "@/lib/ticket-actions";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { InternalNoteSection } from "@/components/tickets/internal-note-section";
import { RatingWidget } from "@/components/tickets/rating-widget";
import { getCannedReplies } from "@/app/actions/canned-reply-actions";
import { format } from "date-fns";
import Link from "next/link";
import { TicketActionsMenu } from "@/components/tickets/ticket-actions-menu";
import { ExportTicketPdfButton } from "@/components/tickets/export-ticket-pdf-button";
import { MergeTicketDialog } from "@/components/tickets/merge-ticket-dialog";
import { FaqFromTicketButton } from "@/components/tickets/faq-from-ticket-button";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  const ticket = await db.ticket.findUnique({
    where: { id: (await params).id },
    include: {
      creator: { select: { name: true, id: true } },
      assignee: { select: { name: true, id: true } },
      device: true,
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      transitions: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return notFound();

  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  // Server component: mốc thời gian lấy 1 lần duy nhất cho mỗi request render.
  const now = Date.now();
  const slaOverdue = isOverdue({
    status: ticket.status,
    slaDeadline: ticket.slaDeadline ? new Date(ticket.slaDeadline) : null,
  });
  const slaRemaining =
    ticket.status !== "CLOSED" && ticket.slaDeadline
      ? Math.max(0, Math.ceil((ticket.slaDeadline.getTime() - now) / (1000 * 60 * 60)))
      : null;

  if (!isCreator && !isTech) {
    return notFound();
  }

  const technicians = isTech
    ? await db.user.findMany({
        where: { role: { in: ["ADMIN", "TECHNICIAN"] } },
        select: { id: true, name: true },
      })
    : [];

  const cannedReplies = isTech ? await getCannedReplies() : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-muted-foreground">
              #{ticket.id.slice(-6).toUpperCase()}
            </span>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            {ticket.status !== "CLOSED" && ticket.slaDeadline && (
              <span
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  slaOverdue ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {slaOverdue ? "Quá hạn SLA" : `SLA còn ${slaRemaining}h`}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold line-clamp-1">{ticket.title}</h1>
        </div>
        <div className="flex items-start gap-2">
          {isTech && <MergeTicketDialog targetTicketId={ticket.id} />}
          {isTech && (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <FaqFromTicketButton ticketId={ticket.id} />
          )}
          <ExportTicketPdfButton ticketId={ticket.id} />
          <TicketActionsMenu ticket={ticket} technicians={technicians} isTech={isTech} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-sm bg-card p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Người tạo
                </p>
                <p className="mt-1 font-medium">{ticket.creator.name}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Người xử lý
                </p>
                <p className="mt-1 font-medium">{ticket.assignee?.name || "Chưa phân công"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Danh mục
                </p>
                <p className="mt-1 font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="mt-1 font-medium">
                  {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>

            {ticket.deviceId && ticket.device && (
              <div className="border rounded-sm bg-muted/50 p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground mr-2">
                    THIẾT BỊ
                  </span>
                  <Link
                    href={`/dashboard/devices/${ticket.deviceId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {ticket.device.name} ({ticket.device.qrCode})
                  </Link>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                MÔ TẢ CHI TIẾT
              </h3>
              <div className="whitespace-pre-wrap text-sm text-foreground/90 p-4 bg-muted/30 rounded-sm border font-mono">
                {ticket.description}
              </div>
            </div>

            {ticket.images.length > 0 && (
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                  HÌNH ẢNH ĐÍNH KÈM [{ticket.images.length}]
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {ticket.images.map((url, idx) => (
                    <a
                      key={url + idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={url}
                        alt={`Ảnh đính kèm ${idx + 1}`}
                        className="aspect-square w-full rounded-sm border border-border object-cover hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {isTech && (
              <InternalNoteSection ticketId={ticket.id} initialNote={ticket.internalNote || null} />
            )}

            {ticket.status === "CLOSED" && (
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  ĐÁNH GIÁ SAU KHI ĐÓNG
                </h3>
                <RatingWidget
                  ticketId={ticket.id}
                  rating={ticket.rating}
                  feedback={ticket.feedback}
                  canReopen={
                    isCreator &&
                    !!ticket.closedAt &&
                    now - new Date(ticket.closedAt).getTime() < 7 * 24 * 3600 * 1000
                  }
                />
              </div>
            )}

            {(ticket.resolvedAt || ticket.closedAt) && (
              <div className="font-mono text-xs text-muted-foreground pt-4 border-t border-border flex gap-4">
                {ticket.resolvedAt && (
                  <p>XỬ LÝ LÚC: {format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm")}</p>
                )}
                {ticket.closedAt && (
                  <p>ĐÓNG LÚC: {format(new Date(ticket.closedAt), "dd/MM/yyyy HH:mm")}</p>
                )}
              </div>
            )}

            {ticket.transitions.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  LỊCH SỬ CHUYỂN TRẠNG THÁI [{ticket.transitions.length}]
                </h3>
                <ol className="space-y-2">
                  {ticket.transitions.map((tr) => (
                    <li key={tr.id} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground w-40 shrink-0">
                        {format(new Date(tr.createdAt), "dd/MM/yyyy HH:mm")}
                      </span>
                      <span className="font-medium">{tr.user.name}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-xs">
                        {tr.fromStatus} → {tr.toStatus}
                      </span>
                      {tr.reason && (
                        <span className="text-muted-foreground italic">({tr.reason})</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <TicketComments
            ticketId={ticket.id}
            comments={ticket.comments}
            currentUserId={session.user.id}
            cannedReplies={cannedReplies}
          />
        </div>
      </div>
    </div>
  );
}
