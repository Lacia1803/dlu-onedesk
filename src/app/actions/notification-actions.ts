"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUnreadNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  return await db.notification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20, // max 20 unread
  });
}

export async function markAsRead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };

  await db.notification.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      isRead: true,
    },
  });

  return { success: true };
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };

  await db.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return { success: true };
}
