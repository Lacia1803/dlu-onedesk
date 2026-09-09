"use server";

import { db } from "@/lib/db";
import { ticketSchema, TicketFormValues, ticketCommentSchema, TicketCommentFormValues, ticketUpdateSchema, TicketUpdateFormValues } from "@/lib/validations/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTicket(data: TicketFormValues) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = ticketSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const ticket = await db.ticket.create({
    data: {
      ...parsed.data,
      deviceId: parsed.data.deviceId || null,
      creatorId: session.user.id,
      status: "OPEN",
    },
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

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${id}`);
  return { success: true };
}
