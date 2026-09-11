"use server";

import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";

const STATUS_VI: Record<string, string> = {
  OPEN: "Cho xu ly",
  IN_PROGRESS: "Dang xu ly",
  WAITING_PARTS: "Cho linh kien",
  RESOLVED: "Da giai quyet",
  CLOSED: "Da dong",
};

const PRIORITY_VI: Record<string, string> = {
  LOW: "Thap",
  MEDIUM: "Trung binh",
  HIGH: "Cao",
  URGENT: "Kan cap",
};

/**
 * In phieu sua chua chi tiet cho 1 ticket (PDF base64).
 * Creator hoac TECH/ADMIN moi duoc goi.
 * ponytail: ASCII-safe text vi font mac dinh cua jsPDF khong co dau tieng Viet;
 * upgrade path: them font Unicode (Noto Sans) neu can dau day du.
 */
export async function exportTicketPdf(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui long dang nhap." };

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: { name: true, email: true } },
      assignee: { select: { name: true } },
      device: { select: { name: true, qrCode: true } },
    },
  });

  if (!ticket) return { success: false, error: "Khong tim thay ticket." };

  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";
  if (!isCreator && !isTech) return { success: false, error: "Khong co quyen." };

  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 50;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PHIEU XU LY TICKET", pageW / 2, y, { align: "center" });
  y += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text("DLU OneDesk - He thong ho tro ky thuat", pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 10;
  doc.setLineWidth(1);
  doc.line(40, y, pageW - 40, y);
  y += 24;

  const info: [string, string][] = [
    ["Ma ticket", `#${ticket.id.slice(-6).toUpperCase()}`],
    ["Tieu de", ticket.title],
    ["Trang thai", STATUS_VI[ticket.status] ?? ticket.status],
    ["Muc do", PRIORITY_VI[ticket.priority] ?? ticket.priority],
    ["Danh muc", ticket.category],
    ["Nguoi tao", `${ticket.creator.name} (${ticket.creator.email})`],
    ["Nguoi xu ly", ticket.assignee?.name || "Chua phan cong"],
    ["Thiet bi", ticket.device ? `${ticket.device.name} (${ticket.device.qrCode})` : "Khong gan"],
    ["Ngay tao", format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")],
    [
      "Ngay xu ly",
      ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm") : "-",
    ],
    ["Ngay dong", ticket.closedAt ? format(new Date(ticket.closedAt), "dd/MM/yyyy HH:mm") : "-"],
  ];

  doc.setFontSize(11);
  for (const [label, value] of info) {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", 40, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(value), pageW - 190);
    doc.text(lines, 170, y);
    y += lines.length * 15 + 5;
  }

  // Description
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Mo ta su co:", 40, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(ticket.description, pageW - 80);
  doc.text(descLines, 40, y);
  y += descLines.length * 13 + 24;

  // Signature block
  doc.setDrawColor(150);
  doc.line(40, y, 240, y);
  doc.line(pageW - 240, y, pageW - 40, y);
  y += 16;
  doc.setFontSize(10);
  doc.text("Ky thuat vien xu ly", 140, y, { align: "center" });
  doc.text("Nguoi bao loi", pageW - 140, y, { align: "center" });
  y += 14;
  doc.setTextColor(140);
  doc.text("(ky, ghi ro ho ten)", 140, y, { align: "center" });
  doc.text("(ky xac nhan da xu ly)", pageW - 140, y, { align: "center" });
  doc.setTextColor(0);

  if (ticket.rating) {
    doc.setFontSize(9);
    doc.text(`Danh gia sau dong ticket: ${ticket.rating}/5 sao`, 40, pageH - 40);
  }

  return { success: true, pdfBase64: doc.output("dataurlstring") };
}
