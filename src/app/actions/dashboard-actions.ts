"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireFreshRole } from "@/lib/permissions";
import { buildWorkbookBuffer, bufferToBase64 } from "@/lib/xlsx";
import { format } from "date-fns";

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

/**
 * Chuẩn bị dữ liệu xuất báo cáo dạng .xlsx ngay trên server và trả về base64.
 * Nhờ vậy client không phải bundle exceljs (~1MB). Trả null nếu không có quyền.
 */
export async function getExportWorkbook(): Promise<{ filename: string; base64: string } | null> {
  const session = await requireFreshRole("ADMIN", "TECHNICIAN");
  if (!session) return null;

  const { devices, tickets } = await getExportData();

  const deviceRows = devices.map((d) => ({
    "Mã QR": d.qrCode,
    "Tên thiết bị": d.name,
    Loại: d.type,
    "Trạng thái": d.status,
    Phòng: d.room.name,
    "Số Serial": d.serialNumber || "",
    "Ngày tạo": format(new Date(d.createdAt), "dd/MM/yyyy HH:mm"),
  }));

  const ticketRows = tickets.map((t) => ({
    "Mã Ticket": t.id,
    "Tiêu đề": t.title,
    "Trạng thái": t.status,
    "Mức độ": t.priority,
    "Danh mục": t.category,
    "Người tạo": t.creator.name,
    "Người xử lý": t.assignee?.name || "",
    "Thiết bị": t.device?.name || "",
    "Ngày tạo": format(new Date(t.createdAt), "dd/MM/yyyy HH:mm"),
    "Ngày giải quyết": t.resolvedAt ? format(new Date(t.resolvedAt), "dd/MM/yyyy HH:mm") : "",
  }));

  const buffer = await buildWorkbookBuffer([
    { name: "Thiết bị", rows: deviceRows },
    { name: "Tickets", rows: ticketRows },
  ]);

  return {
    filename: `BaoCao-ITHelpdesk-${format(new Date(), "yyyyMMdd")}.xlsx`,
    base64: bufferToBase64(buffer),
  };
}
