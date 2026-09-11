import * as z from "zod";

export const guestTicketSchema = z.object({
  studentId: z.string().min(2, "Nhập mã sinh viên hoặc họ tên"),
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(150),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
});

export type GuestTicketValues = z.infer<typeof guestTicketSchema>;
