"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const NOTIFICATION_PAGE_SIZE = 20;

// Pure helper — dễ kiểm thử, không đụng DB.
export function notificationPageSkip(page: number, pageSize = NOTIFICATION_PAGE_SIZE) {
  const p = Math.max(1, Math.floor(page) || 1);
  return (p - 1) * pageSize;
}

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

export async function getAllNotifications(
  filter: "ALL" | "UNREAD" | string = "ALL",
  page = 1,
  pageSize = NOTIFICATION_PAGE_SIZE
) {
  const session = await getServerSession(authOptions);
  if (!session) return { items: [], total: 0, page: 1, pageSize, totalPages: 0 };

  const where: { userId: string; isRead?: boolean; type?: string } = { userId: session.user.id };
  if (filter === "UNREAD") where.isRead = false;
  else if (filter !== "ALL") where.type = filter;

  const p = Math.max(1, Math.floor(page) || 1);
  const [items, total] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: notificationPageSkip(p, pageSize),
      take: pageSize,
    }),
    db.notification.count({ where }),
  ]);

  return { items, total, page: p, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getNotificationStats() {
  const session = await getServerSession(authOptions);
  if (!session) return { unread: 0, openTickets: 0, pendingFaqs: 0 };

  const [unread, openTickets, pendingFaqs] = await Promise.all([
    db.notification.count({ where: { userId: session.user.id, isRead: false } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] } } }),
    db.faq.count({ where: { isActive: false } }),
  ]);

  return { unread, openTickets, pendingFaqs };
}

export async function deleteNotification(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false };

  await db.notification.deleteMany({ where: { id, userId: session.user.id } });
  return { success: true };
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
