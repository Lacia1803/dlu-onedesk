import { db } from "@/lib/db";

export async function notifyUsers(userIds: string[], title: string, message: string, linkUrl?: string, type?: string) {
  if (!userIds || userIds.length === 0) return;

  const data = userIds.map((userId) => ({
    userId,
    title,
    message,
    linkUrl,
    type: type ?? "GENERAL",
  }));

  await db.notification.createMany({
    data,
  });
}

export async function notifyAdminsAndTechs(title: string, message: string, linkUrl?: string, type?: string) {
  const users = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "TECHNICIAN"] },
    },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);
  await notifyUsers(userIds, title, message, linkUrl, type);
}

export async function notifyAdmins(title: string, message: string, linkUrl?: string, type?: string) {
  const admins = await db.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  await notifyUsers(admins.map((a) => a.id), title, message, linkUrl, type);
}
