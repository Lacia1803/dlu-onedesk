"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyUsers } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

import { rateLimit } from "@/lib/cache";

export async function mergeTickets(targetTicketId: string, duplicateTicketIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Không có quyền gộp ticket." };
  }

  const { allowed } = await rateLimit(`${session.user.id}:merge`, 10, 60 * 1000);
  if (!allowed) {
    return { success: false, error: "Quá nhiều yêu cầu gộp ticket, vui lòng chờ 1 phút." };
  }

  if (!duplicateTicketIds || duplicateTicketIds.length === 0) {
    return { success: false, error: "Vui lòng chọn ít nhất một ticket trùng." };
  }

  const target = await db.ticket.findUnique({ where: { id: targetTicketId } });
  if (!target) return { success: false, error: "Ticket gốc không tồn tại." };

  const duplicates = await db.ticket.findMany({
    where: { id: { in: duplicateTicketIds } },
    select: { id: true, title: true, creatorId: true, status: true },
  });

  const now = new Date();

  // 1. Chuyển trạng thái các ticket trùng thành CLOSED
  await db.ticket.updateMany({
    where: { id: { in: duplicateTicketIds } },
    data: {
      status: "CLOSED",
      closedAt: now,
      internalNote: `[GỘP TICKET] Đã gộp vào Ticket gốc #${targetTicketId.slice(-6).toUpperCase()}`,
    },
  });

  // 2. Ghi transition history cho các ticket bị gộp
  await db.ticketTransition.createMany({
    data: duplicates.map((d) => ({
      ticketId: d.id,
      fromStatus: d.status,
      toStatus: "CLOSED",
      reason: `Merged into #${targetTicketId.slice(-6).toUpperCase()}`,
      userId: session.user.id,
    })),
  });

  // 3. Thêm bình luận liên kết trên Ticket gốc
  const mergeNotice =
    `[HỆ THỐNG] Đã gộp ${duplicates.length} ticket trùng vào đây:\n` +
    duplicates.map((d) => `- #${d.id.slice(-6).toUpperCase()}: ${d.title}`).join("\n");

  await db.ticketComment.create({
    data: {
      ticketId: targetTicketId,
      authorId: session.user.id,
      content: mergeNotice,
    },
  });

  // 4. Thông báo cho người tạo ticket bị gộp
  const creatorIds = Array.from(new Set(duplicates.map((d) => d.creatorId)));
  await notifyUsers(
    creatorIds,
    "Ticket đã được gộp",
    `Ticket của bạn đã được gộp vào Ticket gốc #${targetTicketId.slice(-6).toUpperCase()} để xử lý chung.`,
    `/dashboard/tickets/${targetTicketId}`,
    "TICKET_STATUS"
  );

  // 5. Audit Log
  await logAudit({
    action: "TICKET_MERGE",
    entity: "Ticket",
    entityId: targetTicketId,
    details: { duplicateTicketIds },
    userId: session.user.id,
  });

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${targetTicketId}`);

  return { success: true };
}
