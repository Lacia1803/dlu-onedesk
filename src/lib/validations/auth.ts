import * as z from "zod";

/**
 * Chính sách mật khẩu mạnh dùng chung (đăng ký, đổi mật khẩu):
 * tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72, "Mật khẩu không được quá 72 ký tự")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(254, "Email không được quá 254 ký tự"),
  password: strongPasswordSchema,
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
