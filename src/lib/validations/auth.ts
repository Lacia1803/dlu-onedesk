import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(254, "Email không được quá 254 ký tự"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(72, "Mật khẩu không được quá 72 ký tự"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(254, "Email không được quá 254 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(128, "Mật khẩu không được quá 128 ký tự"),
});
