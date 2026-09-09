import * as z from "zod";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";

export const ticketSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(150),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  deviceId: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

export const ticketCommentSchema = z.object({
  content: z.string().min(1, "Nội dung bình luận không được để trống"),
});

export type TicketCommentFormValues = z.infer<typeof ticketCommentSchema>;

export const ticketUpdateSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assigneeId: z.string().optional().or(z.literal("")),
});

export type TicketUpdateFormValues = z.infer<typeof ticketUpdateSchema>;
