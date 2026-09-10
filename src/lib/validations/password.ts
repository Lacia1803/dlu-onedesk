import * as z from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái")
      .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu hiện tại",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
