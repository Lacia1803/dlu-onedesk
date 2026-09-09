"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface CannedReplyItem {
  id: string;
  title: string;
  content: string;
}

// Chỉ ADMIN/TECHNICIAN được quản lý canned replies
async function requireTech() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return null;
  }
  return session;
}

export async function getCannedReplies(): Promise<CannedReplyItem[]> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return [];
  }
  return db.cannedReply.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, content: true },
  });
}

export async function createCannedReply(title: string, content: string) {
  const session = await requireTech();
  if (!session) return { success: false, error: "Không có quyền." };
  if (!title.trim() || !content.trim()) return { success: false, error: "Thiếu tiêu đề hoặc nội dung." };

  await db.cannedReply.create({ data: { title: title.trim(), content: content.trim() } });
  revalidatePath("/dashboard/settings/canned-replies");
  return { success: true };
}

export async function deleteCannedReply(id: string) {
  const session = await requireTech();
  if (!session) return { success: false, error: "Không có quyền." };

  await db.cannedReply.delete({ where: { id } });
  revalidatePath("/dashboard/settings/canned-replies");
  return { success: true };
}
