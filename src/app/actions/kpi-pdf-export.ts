"use server";

import { jsPDF } from "jspdf";
import { requireFreshAdmin } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { getTechKPI } from "@/app/actions/kpi-actions";
import {
  DEJAVU_SANS_REGULAR_BASE64,
  DEJAVU_SANS_BOLD_BASE64,
} from "@/lib/fonts/vietnamese-font";

const FONT_REGULAR = "DejaVuSans";
const FONT_BOLD = "DejaVuSans-Bold";

/**
 * Export KPI dashboard (all tech) as PDF (base64 dataurl) — font Unicode tiếng Việt.
 * Only ADMIN can request.
 */
export async function exportKpiPdf() {
  const session = await requireFreshAdmin();
  if (!session) {
    return { success: false, error: "Không có quyền." };
  }

  const data = await getTechKPI();

  const doc = new jsPDF({ format: "a4", unit: "pt" });

  // Embed Vietnamese-capable Unicode font (subset DejaVu Sans)
  doc.addFileToVFS("DejaVuSans.ttf", DEJAVU_SANS_REGULAR_BASE64);
  doc.addFont("DejaVuSans.ttf", FONT_REGULAR, "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", DEJAVU_SANS_BOLD_BASE64);
  doc.addFont("DejaVuSans-Bold.ttf", FONT_BOLD, "bold");
  doc.setFont(FONT_REGULAR, "normal");

  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont(FONT_BOLD, "bold");
  doc.text("Báo cáo KPI Kỹ thuật viên", 40, 45);

  doc.setFontSize(10);
  doc.setFont(FONT_REGULAR, "normal");
  doc.setTextColor(120);
  doc.text(`Trường Đại học Đà Lạt — Trung tâm CNTT · Tại: ${new Date().toLocaleString("vi-VN")}`, 40, 65);
  doc.setTextColor(0);

  const headers = ["Kỹ thuật viên", "Tickets", "TB giờ xử lý", "Quá hạn"];
  const colX = [40, 240, 320, 420];
  let y = 95;

  doc.setFontSize(11);
  doc.setFont(FONT_BOLD, "bold");
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  doc.setLineWidth(0.5);
  doc.line(40, y + 5, pageW - 40, y + 5);
  y += 22;

  doc.setFont(FONT_REGULAR, "normal");
  doc.setFontSize(10);
  for (const r of data) {
    doc.text(String(r.name ?? "-").slice(0, 40), colX[0], y);
    doc.text(String(r.ticketCount), colX[1], y);
    doc.text(r.avgResolutionHours !== null ? String(r.avgResolutionHours) : "-", colX[2], y);
    doc.text(`${r.overdueRatio}%`, colX[3], y);
    y += 16;
    if (y > doc.internal.pageSize.getHeight() - 40) break; // ponytail: 1 page, add pagination when >30 techs
  }

  if (data.length === 0) {
    doc.text("Chưa có dữ liệu được ghi nhận.", colX[0], y);
  }

  const pdfBase64 = doc.output("dataurlstring");

  await logAudit({
    action: "KPI_PDF_EXPORT",
    entity: "KPI",
    details: { count: data.length },
    userId: session.user.id,
  });

  return { success: true, pdfBase64 };
}
