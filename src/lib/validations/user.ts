import * as z from "zod";
import { Role } from "@prisma/client";

export const userRoleUpdateSchema = z.object({
  id: z.string().min(1, "Thiếu ID người dùng"),
  role: z.nativeEnum(Role),
});

// Đánh dấu người dùng mới được import hoặc tạo bằng mật khẩu mặc định để buộc đổi mật khẩu
export const userCreationSchema = z.object({
  id: z.string().min(1),
  mustChangePassword: z.boolean().optional().default(true),
});
