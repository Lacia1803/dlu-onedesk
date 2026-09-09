"use server";

import { db } from "@/lib/db";
import { userSettingsSchema } from "@/lib/validations/user-settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserSettings(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = userSettingsSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const result = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatar: parsed.data.avatar || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}
