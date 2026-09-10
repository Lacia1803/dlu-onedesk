"use server";

import { db } from "@/lib/db";
import { faqSchema, FaqFormValues } from "@/lib/validations/faq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function checkAdminOrTech(session: { user: { role: string } } | null) {
  return session !== null && (session.user.role === "ADMIN" || session.user.role === "TECHNICIAN");
}

export async function createFaq(data: FaqFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkAdminOrTech(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  await db.faq.create({
    data: {
      ...parsed.data,
      authorId: session!.user.id,
    },
  });

  revalidatePath("/dashboard/faq");
  revalidatePath("/dashboard/faq/manage");
  return { success: true };
}

export async function updateFaq(id: string, data: FaqFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkAdminOrTech(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  await db.faq.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/faq");
  revalidatePath("/dashboard/faq/manage");
  return { success: true };
}

export async function deleteFaq(id: string) {
  const session = await getServerSession(authOptions);
  if (!checkAdminOrTech(session)) return { success: false, error: "Không có quyền thao tác." };

  await db.faq.delete({
    where: { id },
  });

  revalidatePath("/dashboard/faq");
  revalidatePath("/dashboard/faq/manage");
  return { success: true };
}
