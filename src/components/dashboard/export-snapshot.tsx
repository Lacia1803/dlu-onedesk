"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Camera, FileImage } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportSnapshot({ children }: { children: React.ReactNode }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);

  async function capture() {
    if (!captureRef.current) throw new Error("Nothing to capture");
    return html2canvas(captureRef.current, {
      scale: 2,
      backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
    });
  }

  async function handleExportPng() {
    try {
      setBusy("png");
      const canvas = await capture();
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `Dashboard-${format(new Date(), "yyyyMMdd")}.png`;
      a.click();
      toast.success("Đã xuất ảnh dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xuất ảnh");
    } finally {
      setBusy(null);
    }
  }

  async function handleExportPdf() {
    try {
      setBusy("pdf");
      const canvas = await capture();
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2], // scale 2 -> px
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Dashboard-${format(new Date(), "yyyyMMdd")}.pdf`);
      toast.success("Đã xuất PDF dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi xuất PDF");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleExportPng} disabled={busy !== null}>
          <FileImage className="mr-2 h-4 w-4" />
          {busy === "png" ? "Đang xuất..." : "Xuất ảnh PNG"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={busy !== null}>
          <Camera className="mr-2 h-4 w-4" />
          {busy === "pdf" ? "Đang xuất..." : "Xuất PDF"}
        </Button>
      </div>
      <div ref={captureRef}>{children}</div>
    </div>
  );
}
