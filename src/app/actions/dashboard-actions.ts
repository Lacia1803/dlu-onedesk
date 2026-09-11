"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminStats() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    throw new Error("Unauthorized");
  }

  const [statusAgg, openTickets, unresolvedTickets, recentTickets] = await Promise.all([
    db.device.groupBy({
      by: ["status"],
      _count: true,
      where: { deletedAt: null },
    }),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] } } }),
    db.ticket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const totalDevices = statusAgg.reduce((sum, item) => sum + item._count, 0);
  const brokenItem = statusAgg.find((item) => item.status === "BROKEN");
  const brokenDevices = brokenItem ? brokenItem._count : 0;

  const pieData = statusAgg.map((item) => ({
    name: item.status,
    value: item._count,
  }));

  return {
    totalDevices,
    brokenDevices,
    openTickets,
    unresolvedTickets,
    pieData,
    recentTickets,
  };
}

export async function getUserStats() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const [totalMyTickets, myOpenTickets, myResolvedTickets, recentTickets] = await Promise.all([
    db.ticket.count({ where: { creatorId: session.user.id } }),
    db.ticket.count({
      where: { creatorId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    db.ticket.count({
      where: { creatorId: session.user.id, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    db.ticket.findMany({
      where: { creatorId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    totalMyTickets,
    myOpenTickets,
    myResolvedTickets,
    recentTickets,
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
      orderBy: { createdAt: "desc" },
    }),
    db.ticket.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        device: { select: { name: true, qrCode: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { devices, tickets };
}
