import { db } from "@/lib/db";

export async function notifyUsers(userIds: string[], title: string, message: string, linkUrl?: string) {
  if (!userIds || userIds.length === 0) return;

  const data = userIds.map((userId) => ({
    userId,
    title,
    message,
    linkUrl,
  }));

  await db.notification.createMany({
    data,
  });
}

export async function notifyAdminsAndTechs(title: string, message: string, linkUrl?: string) {
  const users = await db.user.findMany({
    where: {
      role: { in: ["ADMIN", "TECHNICIAN"] },
    },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);
  await notifyUsers(userIds, title, message, linkUrl);
}
