"use server";

import { jsPDF } from "jspdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getTechKPI } from "@/app/actions/kpi-actions";

/**
 * Export KPI dashboard (all tech) as PDF (base64 dataurl).
 * Only ADMIN can request.
 */
export async function exportKpiPdf() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Không có quyền." };
  }

  const data = await getTechKPI();

  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("Bao cao KPI Ky thuat vien", 40, 45);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Tai: ${new Date().toLocaleString("vi-VN")} - DLU OneDesk`, 40, 62);
  doc.setTextColor(0);

  const headers = ["Technician", "Tickets", "Avg (h)", "Overdue %"];
  const colX = [40, 230, 300, 380];
  let y = 90;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  doc.setLineWidth(0.5);
  doc.line(40, y + 5, pageW - 40, y + 5);
  y += 20;

  doc.setFont("helvetica", "normal");
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
    doc.text("Khong duoc ghi nhan.", colX[0], y);
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
