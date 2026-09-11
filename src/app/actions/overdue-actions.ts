"use server";

import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { requireFreshAdmin } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

/**
 * Gửi email nhắc reminder cho các ticket QUÁ HẠN SLA (đang xử lý, chưa tạm dừng SLA).
 * Chỉ ADMIN mới được gọi.
 * Sử dụng SMTP cấu hình qua env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export async function sendOverdueReminder() {
  const session = await requireFreshAdmin();
  if (!session) {
    return { success: false, error: "Không có quyền" };
  }

  const now = new Date();
  const overdueTickets = await db.ticket.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] },
      slaDeadline: { lt: now },
      slaPausedAt: null,
      maintenancePlanId: null,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      slaDeadline: true,
      assignee: { select: { email: true, name: true } },
    },
  });

  if (overdueTickets.length === 0) {
    return { success: true, message: "Không có ticket quá hạn" };
  }

  // transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || "no-reply@dlu.edu.vn";
  const promises = overdueTickets.map(async (t) => {
    if (!t.assignee?.email) return null;
    const mailOptions = {
      from,
      to: t.assignee.email,
      subject: `Ticket quá hạn SLA: ${t.title}`,
      text: `Ticket #${t.id.slice(-6).toUpperCase()} đã QUÁ HẠN SLA.\nHạn SLA: ${t.slaDeadline?.toLocaleString("vi-VN") ?? "N/A"}\nNgày tạo: ${t.createdAt.toLocaleString("vi-VN")}\nVui lòng xem và xử lý.`,
    };
    await transporter.sendMail(mailOptions);
    return t.id;
  });

  const sentIds = (await Promise.all(promises)).filter(Boolean);

  await logAudit({
    action: "OVERDUE_REMINDER",
    entity: "Ticket",
    details: { count: sentIds.length },
    userId: session.user.id,
  });

  return { success: true, sent: sentIds.length };
}
