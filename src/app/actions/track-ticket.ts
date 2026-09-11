"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/cache";
import { TicketStatus, Prisma } from "@prisma/client";

export interface PublicTrackResult {
  code: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  deviceName?: string;
  roomName?: string;
  transitions: Array<{
    status: TicketStatus;
    createdAt: string;
  }>;
}

const STUDENT_ID_MARKER = "[Mã sinh viên/Người báo]: ";
const CUID_RE = /^[a-z0-9]{20,32}$/i;
const SUFFIX_RE = /^[a-z0-9]{6}$/i;

const publicSelect = {
  id: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  device: { select: { name: true, room: { select: { name: true } } } },
  transitions: {
    orderBy: { createdAt: "asc" },
    select: { toStatus: true, createdAt: true },
  },
} satisfies Prisma.TicketSelect;

type PublicTicket = Prisma.TicketGetPayload<{ select: typeof publicSelect }>;

/**
 * Tra cứu tiến độ ticket công khai (không cần đăng nhập).
 * Bảo mật: CHỈ khớp chính xác một trong ba dạng:
 *   1. Mã CUID đầy đủ của ticket.
 *   2. Đúng 6 ký tự đuôi của mã ticket.
 *   3. Mã sinh viên chính xác (khớp đúng marker trong mô tả).
 * Không tìm mờ theo mô tả, không trả bình luận nội bộ, có rate limit chống dò.
 */
export async function trackTicket(
  query: string
): Promise<{ success: boolean; data?: PublicTrackResult; error?: string }> {
  // Rate limit theo IP để chống enumeration.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = await rateLimit(`track:${ip}`, 20, 60_000);
  if (!allowed) {
    return { success: false, error: "Quá nhiều lượt tra cứu. Vui lòng thử lại sau một phút." };
  }

  const q = query.trim();
  if (!q) {
    return { success: false, error: "Vui lòng nhập mã ticket hoặc mã sinh viên." };
  }
  if (q.length > 64) {
    return { success: false, error: "Mã tra cứu không hợp lệ." };
  }

  let ticket: PublicTicket | null = null;

  // 1. Mã CUID đầy đủ → khớp chính xác theo id.
  if (CUID_RE.test(q)) {
    ticket = await db.ticket.findFirst({ where: { id: q }, select: publicSelect });
  }

  // 2. Đúng 6 ký tự đuôi của mã ticket.
  if (!ticket && SUFFIX_RE.test(q)) {
    ticket = await db.ticket.findFirst({
      where: { id: { endsWith: q.toLowerCase() } },
      orderBy: { createdAt: "desc" },
      select: publicSelect,
    });
  }

  // 3. Mã sinh viên chính xác (khớp nguyên marker, không tìm mờ tự do).
  if (!ticket) {
    ticket = await db.ticket.findFirst({
      where: { description: { contains: `${STUDENT_ID_MARKER}${q}` } },
      orderBy: { createdAt: "desc" },
      select: publicSelect,
    });
  }

  if (!ticket) {
    return { success: false, error: "Không tìm thấy ticket phù hợp với mã đã nhập." };
  }

  return {
    success: true,
    data: {
      code: ticket.id.slice(-6).toUpperCase(),
      title: ticket.title,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      deviceName: ticket.device?.name,
      roomName: ticket.device?.room?.name,
      transitions: ticket.transitions.map((t) => ({
        status: t.toStatus,
        createdAt: t.createdAt.toISOString(),
      })),
    },
  };
}
