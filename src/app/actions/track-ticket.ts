"use server";

import { db } from "@/lib/db";
import { TicketStatus } from "@prisma/client";

export interface PublicTrackResult {
  id: string;
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
  comments: Array<{
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

export async function trackTicket(query: string): Promise<{ success: boolean; data?: PublicTrackResult; error?: string }> {
  const q = query.trim();
  if (!q) {
    return { success: false, error: "Vui lòng nhập mã ticket hoặc mã sinh viên." };
  }

  // 1. Try direct CUID match first
  let ticket = await db.ticket.findUnique({
    where: { id: q },
    include: {
      device: { select: { name: true, room: { select: { name: true } } } },
      transitions: { orderBy: { createdAt: "asc" } },
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // 2. If not found by full ID, search by 6-char suffix or student ID in description
  if (!ticket) {
    const candidates = await db.ticket.findMany({
      where: {
        OR: [
          { id: { endsWith: q.toLowerCase() } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        device: { select: { name: true, room: { select: { name: true } } } },
        transitions: { orderBy: { createdAt: "asc" } },
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (candidates.length > 0) {
      ticket = candidates[0];
    }
  }

  if (!ticket) {
    return { success: false, error: "Không tìm thấy ticket phù hợp với mã đã nhập." };
  }

  return {
    success: true,
    data: {
      id: ticket.id,
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
      comments: ticket.comments.map((c) => ({
        authorName: c.author.name,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
    },
  };
}
