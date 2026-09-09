"use server";

import { db } from "@/lib/db";

export interface MaintenanceLogWithDetails {
  id: string;
  type: string;
  description: string;
  cost: number | null;
  performedAt: Date;
  deviceId: string;
  device: { name: string; room: { name: string } };
  technician: { name: string | null };
}

export async function getMaintenanceLogsByMonth(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const logs = await db.maintenanceLog.findMany({
    where: { performedAt: { gte: start, lte: end } },
    include: {
      device: { select: { name: true, room: { select: { name: true } } } },
      technician: { select: { name: true } },
    },
    orderBy: { performedAt: "asc" },
  });

  return logs as MaintenanceLogWithDetails[];
}

export async function getAllMaintenanceLogs() {
  const logs = await db.maintenanceLog.findMany({
    include: {
      device: { select: { name: true, room: { select: { name: true } } } },
      technician: { select: { name: true } },
    },
    orderBy: { performedAt: "desc" },
  });

  return logs as MaintenanceLogWithDetails[];
}
