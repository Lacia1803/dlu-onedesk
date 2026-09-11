"use server";

import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { TicketStatus } from "@prisma/client";

/**
 * Gửi email nhắc reminder cho các ticket quá hạn (>3 ngày, chưa CLOSED).
 * Chỉ ADMIN mới được gọi.
 * Sử dụng SMTP cấu hình qua env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export async function sendOverdueReminder() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Không có quyền" };
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const overdueTickets = await db.ticket.findMany({
    where: { status: { not: TicketStatus.CLOSED }, createdAt: { lt: threeDaysAgo } },
    select: {
      id: true,
      title: true,
      createdAt: true,
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
      subject: `Ticket quá hạn: ${t.title}`,
      text: `Ticket #${t.id.slice(-6).toUpperCase()} đã mở hơn 3 ngày mà vẫn chưa đóng.\nCreated: ${t.createdAt}\nVui lòng xem và xử lý.`,
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
