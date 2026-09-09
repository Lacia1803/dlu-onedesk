"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportTicketPdf } from "@/app/actions/ticket-pdf-export";
import { toast } from "sonner";
import { Printer } from "lucide-react";

export function ExportTicketPdfButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const res = await exportTicketPdf(ticketId);
      if (res.success && "pdfBase64" in res && res.pdfBase64) {
        const link = document.createElement("a");
        link.href = res.pdfBase64;
        link.download = `Ticket-${ticketId.slice(-6).toUpperCase()}.pdf`;
        link.click();
        toast.success("Đã xuất phiếu xử lý PDF");
      } else {
        toast.error("error" in res ? res.error || "Xuất thất bại" : "Xuất thất bại");
      }
    } catch {
      toast.error("Lỗi khi xuất PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Printer className="mr-2 h-4 w-4" />
      {loading ? "Đang xuất..." : "In phiếu PDF"}
    </Button>
  );
}
