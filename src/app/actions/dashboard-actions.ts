"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminStats() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    throw new Error("Unauthorized");
  }

  const [
    totalDevices,
    brokenDevices,
    openTickets,
    unresolvedTickets,
    devices,
    recentTickets
  ] = await Promise.all([
    db.device.count({ where: { deletedAt: null } }),
    db.device.count({ where: { deletedAt: null, status: "BROKEN" } }),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] } } }),
    db.device.findMany({ where: { deletedAt: null }, select: { status: true } }),
    db.ticket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { name: true } }, assignee: { select: { name: true } } }
    })
  ]);

  // Aggregate device statuses for pie chart
  const statusCounts = devices.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));

  return {
    totalDevices,
    brokenDevices,
    openTickets,
    unresolvedTickets,
    pieData,
    recentTickets
  };
}

export async function getUserStats() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const [totalMyTickets, myOpenTickets, myResolvedTickets, recentTickets] = await Promise.all([
    db.ticket.count({ where: { creatorId: session.user.id } }),
    db.ticket.count({ where: { creatorId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.ticket.count({ where: { creatorId: session.user.id, status: { in: ["RESOLVED", "CLOSED"] } } }),
    db.ticket.findMany({
      where: { creatorId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { name: true } } }
    })
  ]);

  return {
    totalMyTickets,
    myOpenTickets,
    myResolvedTickets,
    recentTickets
  };
}

export async function getExportData() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    throw new Error("Unauthorized");
  }

  const [devices, tickets] = await Promise.all([
    db.device.findMany({
      where: { deletedAt: null },
      include: { room: true },
      orderBy: { createdAt: "desc" }
    }),
    db.ticket.findMany({
      include: { creator: true, assignee: true, device: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { devices, tickets };
}
