"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { isOverdue } from "@/lib/ticket-actions";

export interface TechKPIResult {
  id: string;
  name: string;
  ticketCount: number;
  avgResolutionHours: number | null;
  overdueRatio: number;
}

/**
 * KPI stats per technician, or for a single technician if userId is provided.
 * Returns: [{ id, name, ticketCount, avgResolutionHours, overdueRatio }]
 */
export async function getTechKPI(userId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  // If specific userId requested, non-admin can only view their own
  const targetId = userId ?? (session.user.role === "USER" ? session.user.id : undefined);

  const whereClause: Prisma.UserWhereInput = {
    role: { in: ["ADMIN", "TECHNICIAN"] },
    deletedAt: null,
  };
  if (targetId) {
    whereClause.id = targetId;
  }

  // Get matching tech users
  const techs = await db.user.findMany({
    where: whereClause,
    select: { id: true, name: true },
  });

  const results: TechKPIResult[] = [];

  for (const tech of techs) {
    // Tickets assigned to this tech (any status)
    const tickets = await db.ticket.findMany({
      where: { assigneeId: tech.id },
      select: {
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        status: true,
        slaDeadline: true,
      },
    });

    const ticketCount = tickets.length;
    // Average resolution time in hours (only RESOLVED or CLOSED)
    const resolved = tickets.filter((t) => t.resolvedAt || t.closedAt);
    const avgResolutionHours = resolved.length
      ? resolved.reduce((sum, t) => {
          const end = t.resolvedAt ?? t.closedAt!;
          const diff = (new Date(end).getTime() - new Date(t.createdAt).getTime()) / 1000 / 3600;
          return sum + diff;
        }, 0) / resolved.length
      : null;

    // Overdue tickets: not CLOSED and past SLA deadline
    const overdue = tickets.filter(
      (t) =>
        isOverdue({ status: t.status, slaDeadline: t.slaDeadline })
    ).length;
    const overdueRatio = ticketCount ? overdue / ticketCount : 0;

    results.push({
      id: tech.id,
      name: tech.name,
      ticketCount,
      avgResolutionHours: avgResolutionHours ? Number(avgResolutionHours.toFixed(2)) : null,
      overdueRatio: Number((overdueRatio * 100).toFixed(1)), // percent
    });
  }

  return results;
}
