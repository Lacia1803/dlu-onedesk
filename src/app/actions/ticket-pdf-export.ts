"use server";

import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import {
  DEJAVU_SANS_REGULAR_BASE64,
  DEJAVU_SANS_BOLD_BASE64,
} from "@/lib/fonts/vietnamese-font";

const FONT_REGULAR = "DejaVuSans";
const FONT_BOLD = "DejaVuSans-Bold";

const STATUS_VI: Record<string, string> = {
  OPEN: "Chờ xử lý",
  IN_PROGRESS: "Đang xử lý",
  WAITING_PARTS: "Chờ linh kiện",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
};

const PRIORITY_VI: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

/**
 * In phiếu sửa chữa chi tiết cho 1 ticket (PDF base64, font Unicode tiếng Việt).
 * Creator hoặc TECH/ADMIN mới được gọi.
 */
export async function exportTicketPdf(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      creator: { select: { name: true, email: true } },
      assignee: { select: { name: true } },
      device: { select: { name: true, qrCode: true, room: { select: { name: true } } } },
    },
  });

  if (!ticket) return { success: false, error: "Không tìm thấy ticket." };

  const isCreator = ticket.creatorId === session.user.id;
  const isTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";
  if (!isCreator && !isTech) return { success: false, error: "Không có quyền." };

  const doc = new jsPDF({ format: "a4", unit: "pt" });

  // Embed Vietnamese-capable Unicode font (subset DejaVu Sans) so diacritics render correctly.
  doc.addFileToVFS("DejaVuSans.ttf", DEJAVU_SANS_REGULAR_BASE64);
  doc.addFont("DejaVuSans.ttf", FONT_REGULAR, "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", DEJAVU_SANS_BOLD_BASE64);
  doc.addFont("DejaVuSans-Bold.ttf", FONT_BOLD, "bold");
  doc.setFont(FONT_REGULAR, "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 50;

  // Header
  doc.setFontSize(16);
  doc.setFont(FONT_BOLD, "bold");
  doc.text("PHIẾU XỬ LÝ SỰ CỐ", pageW / 2, y, { align: "center" });
  y += 20;
  doc.setFontSize(10);
  doc.setFont(FONT_REGULAR, "normal");
  doc.setTextColor(110);
  doc.text("Trường Đại học Đà Lạt — Trung tâm CNTT", pageW / 2, y, { align: "center" });
  y += 14;
  doc.text("DLU OneDesk — Hệ thống hỗ trợ kỹ thuật phòng máy", pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 12;
  doc.setLineWidth(1);
  doc.line(40, y, pageW - 40, y);
  y += 26;

  const info: [string, string][] = [
    ["Mã ticket", `#${ticket.id.slice(-6).toUpperCase()}`],
    ["Tiêu đề", ticket.title],
    ["Trạng thái", STATUS_VI[ticket.status] ?? ticket.status],
    ["Mức độ", PRIORITY_VI[ticket.priority] ?? ticket.priority],
    ["Danh mục", ticket.category],
    ["Người tạo", `${ticket.creator.name} (${ticket.creator.email})`],
    ["Người xử lý", ticket.assignee?.name || "Chưa phân công"],
    [
      "Thiết bị",
      ticket.device ? `${ticket.device.name} (QR: ${ticket.device.qrCode})` : "Không gắn",
    ],
    [
      "Phòng máy",
      ticket.device?.room?.name ? `Phòng ${ticket.device.room.name}` : "—",
    ],
    ["Ngày tạo", format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")],
    [
      "Ngày xử lý",
      ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm") : "-",
    ],
    ["Ngày đóng", ticket.closedAt ? format(new Date(ticket.closedAt), "dd/MM/yyyy HH:mm") : "-"],
  ];

  doc.setFontSize(11);
  for (const [label, value] of info) {
    doc.setFont(FONT_BOLD, "bold");
    doc.text(label + ":", 40, y);
    doc.setFont(FONT_REGULAR, "normal");
    const lines = doc.splitTextToSize(String(value), pageW - 190);
    doc.text(lines, 170, y);
    y += lines.length * 16 + 6;
  }

  // Description
  y += 12;
  doc.setFont(FONT_BOLD, "bold");
  doc.text("Mô tả sự cố:", 40, y);
  y += 16;
  doc.setFont(FONT_REGULAR, "normal");
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(ticket.description, pageW - 80);
  doc.text(descLines, 40, y);
  y += descLines.length * 13 + 30;

  // Signature block
  doc.setDrawColor(150);
  doc.line(40, y, 240, y);
  doc.line(pageW - 240, y, pageW - 40, y);
  y += 18;
  doc.setFontSize(10);
  doc.setFont(FONT_REGULAR, "normal");
  doc.text("Kỹ thuật viên xử lý", 140, y, { align: "center" });
  doc.text("Người báo lỗi", pageW - 140, y, { align: "center" });
  y += 16;
  doc.setTextColor(140);
  doc.text("(ký, ghi rõ họ tên)", 140, y, { align: "center" });
  doc.text("(xác nhận đã xử lý xong)", pageW - 140, y, { align: "center" });
  doc.setTextColor(0);

  if (ticket.rating) {
    doc.setFontSize(9);
    doc.text(`Đánh giá sau khi đóng ticket: ${ticket.rating}/5 sao`, 40, pageH - 40);
  }

  return { success: true, pdfBase64: doc.output("dataurlstring") };
}
