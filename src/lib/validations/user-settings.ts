import * as z from "zod";

export const userSettingsSchema = z.object({
  name: z.string().min(2, "Tên ít nhất 2 ký tự"),
  phone: z.string()
    .regex(/^\+?\d{7,15}$/, "Số điện thoại không hợp lệ (7‑15 chữ số, có thể có + ở đầu)")
    .optional()
    .or(z.literal("")),
  avatar: z.string().url("Avatar phải là URL hợp lệ").optional().or(z.literal("")),
});

export type UserSettingsValues = z.infer<typeof userSettingsSchema>;
