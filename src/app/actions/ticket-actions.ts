"use server";

import { db } from "@/lib/db";
import { ticketSchema, TicketFormValues, ticketCommentSchema, TicketCommentFormValues, ticketUpdateSchema, TicketUpdateFormValues } from "@/lib/validations/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyUsers, notifyAdminsAndTechs } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export async function createTicket(data: TicketFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = ticketSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const ticket = await db.ticket.create({
    data: {
      ...parsed.data,
      deviceId: parsed.data.deviceId || null,
      images: parsed.data.images || [],
      creatorId: session.user.id,
      status: "OPEN",
    },
  });

  // Notify Admins and Techs
  await notifyAdminsAndTechs(
    "Ticket mới",
    `Ticket #${ticket.id.slice(-6).toUpperCase()}: ${ticket.title}`,
    `/dashboard/tickets/${ticket.id}`
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
      `/dashboard/tickets/${ticket.id}`
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

  if (parsed.data.status === "RESOLVED" && ticket.status !== "RESOLVED") {
    updateData.resolvedAt = new Date();
  }
  if (parsed.data.status === "CLOSED" && ticket.status !== "CLOSED") {
    updateData.closedAt = new Date();
  }

  await db.ticket.update({
    where: { id },
    data: updateData,
  });

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
      `/dashboard/tickets/${ticket.id}`
    );
  }

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${id}`);
  return { success: true };
}
