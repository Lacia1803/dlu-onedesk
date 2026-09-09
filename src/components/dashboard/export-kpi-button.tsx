"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportKpiPdf } from "@/app/actions/kpi-pdf-export";
import { toast } from "sonner";
import { FileBarChart } from "lucide-react";

export function ExportKpiButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const res = await exportKpiPdf();
      if (res.success && "pdfBase64" in res && res.pdfBase64) {
        const link = document.createElement("a");
        link.href = res.pdfBase64;
        link.download = `KPI-${new Date().toISOString().split("T")[0]}.pdf`;
        link.click();
        toast.success("Đã xuất báo cáo KPI");
      } else {
        toast.error("error" in res ? res.error || "Xuất thất bại" : "Xuất thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xuất PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <FileBarChart className="mr-2 h-4 w-4" />
      {loading ? "Đang xuất..." : "Xuất KPI PDF"}
    </Button>
  );
}
