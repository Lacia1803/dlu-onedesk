import type { TicketComment, Ticket, Prisma } from "@prisma/client";

/** Bình luận ticket kèm thông tin tác giả — dùng cho TicketComments. */
export interface TicketCommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date | string;
  authorId: string;
  author: { name: string | null };
}

/** Trả lời mẫu (canned reply) hiển thị trên khung bình luận. */
export interface CannedReplyLite {
  id: string;
  title: string;
  content: string;
}

/** Dữ liệu FAQ dùng làm initialData cho FaqForm. */
export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

/** Ticket được truyền vào TicketActionsMenu. */
export interface TicketActionItem {
  id: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  assignee?: { name: string | null } | null;
  createdAt: Date | string;
  [key: string]: unknown;
}

/** Kiểu where động cho các truy vấn Prisma có điều kiện OR. */
export type DynamicWhere =
  Prisma.TicketWhereInput | Prisma.DeviceWhereInput | Prisma.AuditLogWhereInput;

export type { TicketComment, Ticket };
