"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyAdmins } from "@/lib/notifications";
import { rateLimit } from "@/lib/cache";

export async function createFaqDraftFromTicket(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Không có quyền thao tác." };
  }

  const { allowed } = rateLimit(`${session.user.id}:faq-draft`, 10, 60 * 1000);
  if (!allowed) {
    return { success: false, error: "Quá nhiều yêu cầu tạo FAQ, vui lòng chờ 1 phút." };
  }

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      comments: {
        where: { author: { role: { in: ["ADMIN", "TECHNICIAN"] } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!ticket) return { success: false, error: "Không tìm thấy ticket." };
  if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED") {
    return { success: false, error: "Chỉ tạo FAQ từ ticket đã xử lý hoặc đã đóng." };
  }

  const solution = ticket.comments[0]?.content || ticket.internalNote;
  if (!solution)
    return { success: false, error: "Ticket chưa có nội dung xử lý (bình luận/ghi chú)." };

  const faq = await db.faq.create({
    data: {
      question: ticket.title,
      answer: `**Dấu hiệu:** ${ticket.description}\n\n**Cách xử lý:**\n${solution}`,
      category: ticket.category,
      isActive: false, // bản nháp — chờ Admin duyệt
      authorId: session.user.id,
    },
  });

  await notifyAdmins(
    "FAQ chờ duyệt",
    `Kỹ thuật viên ${session.user.name} vừa gửi bản nháp FAQ từ Ticket #${ticket.id.slice(-6).toUpperCase()}: "${ticket.title}"`,
    "/dashboard/faq/manage",
    "FAQ"
  );

  revalidatePath("/dashboard/faq/manage");
  return { success: true, faqId: faq.id };
}

export async function approveFaqDraft(id: string, approve: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Chỉ Admin mới duyệt được FAQ." };
  }

  await db.faq.update({ where: { id }, data: { isActive: approve } });

  revalidatePath("/dashboard/faq");
  revalidatePath("/dashboard/faq/manage");
  return { success: true };
}
