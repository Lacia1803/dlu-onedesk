"use server";

import { db } from "@/lib/db";
import { ticketSchema, TicketFormValues, ticketCommentSchema, TicketCommentFormValues, ticketUpdateSchema, TicketUpdateFormValues } from "@/lib/validations/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyUsers, notifyAdminsAndTechs } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { getCannedReplies } from "@/app/actions/canned-reply-actions";


import { computeSlaDeadline, isValidTransition, VALID_TRANSITIONS } from "@/lib/ticket-actions";

export async function createTicket(data: TicketFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = ticketSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const slaDeadline = computeSlaDeadline(parsed.data.priority);

  const ticket = await db.ticket.create({
    data: {
      ...parsed.data,
      deviceId: parsed.data.deviceId || null,
      images: parsed.data.images || [],
      creatorId: session.user.id,
      status: "OPEN",
      slaDeadline,
    },
  });

  // Notify Admins and Techs
  await notifyAdminsAndTechs(
    "Ticket mới",
    `Ticket #${ticket.id.slice(-6).toUpperCase()}: ${ticket.title}`,
    `/dashboard/tickets/${ticket.id}`,
    "TICKET_STATUS"
  );

  await logAudit({
    action: "TICKET_CREATE",
    entity: "Ticket",
    entityId: ticket.id,
    details: { title: ticket.title, priority: ticket.priority, category: ticket.category },
    userId: session.user.id,
  });

  revalidatePath("/dashboard/tickets");
  return { success: true, ticketId: ticket.id };
}

export async function addTicketComment(ticketId: string, data: TicketCommentFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = ticketCommentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, error: "Không tìm thấy ticket." };

  // Only Admin, Tech, or Creator can comment
  if (session.user.role === "USER" && ticket.creatorId !== session.user.id) {
    return { success: false, error: "Không có quyền thao tác." };
  }

  await db.ticketComment.create({
    data: {
      content: parsed.data.content,
      ticketId,
      authorId: session.user.id,
    },
  });

  // First response: comment đầu tiên của Tech/Admin → ghi mốc phản hồi SLA
  const responderRole = session.user.role;
  if ((responderRole === "ADMIN" || responderRole === "TECHNICIAN") && !ticket.firstResponseAt) {
    await db.ticket.update({ where: { id: ticketId }, data: { firstResponseAt: new Date() } });
  }

  // Notifications
  const notifyList = [];
  if (session.user.id !== ticket.creatorId) {
    notifyList.push(ticket.creatorId);
  }
  if (ticket.assigneeId && session.user.id !== ticket.assigneeId) {
    notifyList.push(ticket.assigneeId);
  }
  
  if (notifyList.length > 0) {
    await notifyUsers(
      notifyList,
      "Bình luận mới",
      `Có bình luận mới trong Ticket #${ticket.id.slice(-6).toUpperCase()}`,
      `/dashboard/tickets/${ticket.id}`,
      "TICKET_COMMENT"
    );
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true };
}

export async function updateTicket(id: string, data: TicketUpdateFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = ticketUpdateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const ticket = await db.ticket.findUnique({ where: { id } });
  if (!ticket) return { success: false, error: "Không tìm thấy ticket." };

  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  if (!isCreator && !isTech) {
    return { success: false, error: "Không có quyền thao tác." };
  }

  // Users can only close tickets, Techs can do anything
  if (!isTech) {
    if (parsed.data.status !== "CLOSED" && parsed.data.status !== undefined) {
      return { success: false, error: "Bạn chỉ có quyền đóng ticket." };
    }
    // Users cannot change priority or assignee
    delete parsed.data.priority;
    delete parsed.data.assigneeId;
  }

  const updateData: any = { ...parsed.data };

  if (updateData.assigneeId === "") updateData.assigneeId = null;

  // Kiểm tra đồ thị chuyển trạng thái (ADMIN được bỏ qua, ngoại trừ CLOSED -> trạng thái khác)
  if (parsed.data.status && parsed.data.status !== ticket.status) {
    const isAdmin = session.user.role === "ADMIN";
    if (ticket.status === "CLOSED") {
      return { success: false, error: "Ticket đã đóng, chỉ mở lại được bằng nút Reopen." };
    }
    if (!isAdmin && !isValidTransition(ticket.status, parsed.data.status)) {
      const allowed = VALID_TRANSITIONS[ticket.status].join(", ") || "không có";
      return { success: false, error: `Không thể chuyển ${ticket.status} → ${parsed.data.status}. Trạng thái hợp lệ: ${allowed}` };
    }
    if (parsed.data.status === "CLOSED" && ticket.status !== "RESOLVED" && !isAdmin) {
      return { success: false, error: "Phải chuyển sang RESOLVED trước khi đóng." };
    }
  }

  const now = new Date();
  if (parsed.data.status === "RESOLVED" && ticket.status !== "RESOLVED") {
    updateData.resolvedAt = now;
  }
  if (parsed.data.status === "CLOSED" && ticket.status !== "CLOSED") {
    updateData.closedAt = now;
  }

  // SLA pause: vào WAITING_PARTS → tạm dừng; ra khỏi WAITING_PARTS → cộng dồn thời gian chờ
  if (parsed.data.status === "WAITING_PARTS" && ticket.status !== "WAITING_PARTS" && !ticket.slaPausedAt) {
    updateData.slaPausedAt = now;
  }
  if (ticket.status === "WAITING_PARTS" && parsed.data.status && parsed.data.status !== "WAITING_PARTS"
      && ticket.slaPausedAt && ticket.slaDeadline) {
    const { extendSlaDeadline } = await import("@/lib/ticket-actions");
    updateData.slaDeadline = extendSlaDeadline(ticket.slaDeadline, ticket.slaPausedAt, now);
    updateData.slaPausedAt = null;
  }
  // Đổi priority → tính lại SLA deadline
  if (parsed.data.priority && parsed.data.priority !== ticket.priority) {
    updateData.slaDeadline = computeSlaDeadline(parsed.data.priority, ticket.createdAt);
  }

  await db.ticket.update({
    where: { id },
    data: updateData,
  });

  // Ghi lịch sử chuyển trạng thái
  if (parsed.data.status && parsed.data.status !== ticket.status) {
    await db.ticketTransition.create({
      data: {
        ticketId: id,
        fromStatus: ticket.status,
        toStatus: parsed.data.status,
        userId: session.user.id,
      },
    });
  }

  // Log audit trail for meaningful changes
  const auditDetails: Record<string, string | { from: string; to: string } | null> = {};
  if (parsed.data.status && parsed.data.status !== ticket.status) {
    auditDetails.status = { from: ticket.status, to: parsed.data.status };
  }
  if (parsed.data.priority && parsed.data.priority !== ticket.priority) {
    auditDetails.priority = { from: ticket.priority, to: parsed.data.priority };
  }
  if (parsed.data.assigneeId !== undefined && parsed.data.assigneeId !== (ticket.assigneeId || "")) {
    auditDetails.assignee = parsed.data.assigneeId || null;
  }
  if (Object.keys(auditDetails).length > 0) {
    await logAudit({
      action: "TICKET_UPDATE",
      entity: "Ticket",
      entityId: id,
      details: auditDetails,
      userId: session.user.id,
    });
  }

  // Notifications
  const notifyList = [];
  let title = "Cập nhật Ticket";
  let message = `Ticket #${ticket.id.slice(-6).toUpperCase()} đã được cập nhật.`;

  // Status changed
  if (parsed.data.status && parsed.data.status !== ticket.status) {
    if (session.user.id !== ticket.creatorId) notifyList.push(ticket.creatorId);
    message = `Ticket #${ticket.id.slice(-6).toUpperCase()} chuyển sang trạng thái: ${parsed.data.status}.`;
  }
  
  // Assignee changed
  if (updateData.assigneeId && updateData.assigneeId !== ticket.assigneeId) {
    if (session.user.id !== updateData.assigneeId) notifyList.push(updateData.assigneeId);
    title = "Phân công Ticket";
    message = `Bạn được phân công xử lý Ticket #${ticket.id.slice(-6).toUpperCase()}.`;
  }

  if (notifyList.length > 0) {
    await notifyUsers(
      [...new Set(notifyList)], // unique ids
      title,
      message,
      `/dashboard/tickets/${ticket.id}`,
      title === "Phân công Ticket" ? "TICKET_ASSIGNED" : "TICKET_STATUS"
    );
  }

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${id}`);
  return { success: true };
}

export async function getTicketsForTechnician(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, tickets: [] };
  if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
    return { success: false, tickets: [] };
  }

  const tickets = await db.ticket.findMany({
    where: {
      assigneeId: userId,
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] },
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      scheduledAt: true,
      device: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, tickets };
}

export async function rateTicket(ticketId: string, rating: number, feedback?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };
  // CSAT: chỉ người tạo ticket (người được phục vụ) được phép đánh giá hài lòng
  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, error: "Ticket không tồn tại." };
  if (ticket.creatorId !== session.user.id) {
    return { success: false, error: "Chỉ người tạo ticket mới được đánh giá mức độ hài lòng." };
  }

  await db.ticket.update({
    where: { id: ticketId },
    data: { rating, feedback: feedback?.trim() || null },
  });

  await logAudit({
    action: "TICKET_RATING",
    entity: "Ticket",
    entityId: ticketId,
    details: { rating, feedback },
    userId: session.user.id,
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true };
}

export async function reopenTicket(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };
  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, error: "Ticket không tồn tại." };
  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";
  if (!isCreator && !isTech) return { success: false, error: "Không có quyền mở lại." };

  if (ticket.status !== "CLOSED") return { success: false, error: "Ticket chưa đóng." };

  // Chỉ được mở lại trong 7 ngày (trừ ADMIN)
  if (session.user.role !== "ADMIN" && (!ticket.closedAt || Date.now() - new Date(ticket.closedAt).getTime() > 7 * 24 * 3600 * 1000)) {
    return { success: false, error: "Quá 7 ngày từ lúc đóng, không thể mở lại." };
  }

  const now = new Date();
  await db.ticket.update({
    where: { id: ticketId },
    data: { status: "OPEN", reopenedAt: now, resolvedAt: null, closedAt: null, slaDeadline: computeSlaDeadline(ticket.priority, now) },
  });

  await db.ticketTransition.create({
    data: { ticketId, fromStatus: ticket.status, toStatus: "OPEN", reason: "Reopen", userId: session.user.id },
  });

  await logAudit({
    action: "TICKET_REOPEN",
    entity: "Ticket",
    entityId: ticketId,
    details: { reopenedAt: new Date() },
    userId: session.user.id,
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true };
}


export async function assignTicketToMe(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };
  if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Không có quyền gán ticket." };
  }

  const userId = session.user.id;
  await db.ticket.update({ where: { id }, data: { assigneeId: userId } });

  await logAudit({
    action: "TICKET_ASSIGN_SELF",
    entity: "Ticket",
    entityId: id,
    userId,
  });

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${id}`);
  return { success: true };
}

export async function bulkUpdateTickets(ids: string[], data: Partial<TicketUpdateFormValues>) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Không có quyền thực hiện." };
  }

  // Ghi transition history cho từng ticket (bulk)
  if (data.status) {
    const current = await db.ticket.findMany({
      where: { id: { in: ids }, status: { not: data.status } },
      select: { id: true, status: true },
    });
    await db.ticketTransition.createMany({
      data: current.map((t) => ({
        ticketId: t.id,
        fromStatus: t.status,
        toStatus: data.status!,
        reason: "Bulk update",
        userId: session.user.id,
      })),
    });
  }

  await db.ticket.updateMany({
    where: { id: { in: ids } },
    data,
  });

  await logAudit({
    action: "TICKET_BULK_UPDATE",
    entity: "Ticket",
    details: { ids, data },
    userId: session.user.id,
  });

  revalidatePath("/dashboard/tickets");
  return { success: true };
}

export async function scheduleTicket(id: string, scheduledAt: Date) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };
  if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Không có quyền lên lịch ticket." };
  }

  await db.ticket.update({ where: { id }, data: { scheduledAt } });

  await logAudit({
    action: "TICKET_SCHEDULE",
    entity: "Ticket",
    entityId: id,
    details: { scheduledAt },
    userId: session.user.id,
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath(`/dashboard/tickets/${id}`);
  return { success: true };
}

// Auto-assign ticket cho TECHNICIAN đang ít việc nhất
export async function autoAssignTicket(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };
  if (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Không có quyền." };
  }

  const techs = await db.user.findMany({
    where: { role: "TECHNICIAN", deletedAt: null },
    select: {
      id: true,
      name: true,
      _count: { select: { ticketsAssigned: { where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] } } } } },
    },
  });

  if (techs.length === 0) return { success: false, error: "Không có kỹ thuật viên nào." };

  const target = techs.sort((a, b) => a._count.ticketsAssigned - b._count.ticketsAssigned)[0];

  await db.ticket.update({ where: { id: ticketId }, data: { assigneeId: target.id } });

  await logAudit({
    action: "TICKET_AUTO_ASSIGN",
    entity: "Ticket",
    entityId: ticketId,
    details: { assignee: target.name, activeTickets: target._count.ticketsAssigned },
    userId: session.user.id,
  });

  await notifyUsers(
    [target.id],
    "Phân công Ticket",
    `Bạn được phân công xử lý Ticket #${ticketId.slice(-6).toUpperCase()} (tự động).`,
    `/dashboard/tickets/${ticketId}`,
    "TICKET_ASSIGNED"
  );

  revalidatePath("/dashboard/tickets");
  return { success: true, assignee: target.name };
}
