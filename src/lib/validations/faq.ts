import * as z from "zod";

export const faqSchema = z.object({
  question: z.string().min(5, "Câu hỏi phải có ít nhất 5 ký tự").max(200),
  answer: z.string().min(10, "Câu trả lời phải có ít nhất 10 ký tự"),
  category: z.string().min(2, "Vui lòng nhập danh mục"),
  isActive: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
