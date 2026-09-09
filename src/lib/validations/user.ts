import * as z from "zod";
import { Role } from "@prisma/client";

export const userRoleUpdateSchema = z.object({
  id: z.string().min(1, "Thiếu ID người dùng"),
  role: z.nativeEnum(Role),
});

export type UserRoleUpdateValues = z.infer<typeof userRoleUpdateSchema>;

export const userSearchSchema = z.object({
  q: z.string().max(100).optional(),
});
