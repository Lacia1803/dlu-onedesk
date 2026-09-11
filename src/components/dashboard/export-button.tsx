"use client";

import { useState } from "react";
import { getExportData, getExportWorkbook } from "@/app/actions/dashboard-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { downloadBase64File, downloadTextFile } from "@/lib/download";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  function toCsv(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join(
      "\n"
    );
  }

  function downloadCsv(name: string, content: string) {
    downloadTextFile(name, content, "text/csv;charset=utf-8");
  }

  async function handleExport(formatType: "excel" | "csv") {
    try {
      setLoading(true);
      const baseName = `BaoCao-ITHelpdesk-${format(new Date(), "yyyyMMdd")}`;

      if (formatType === "excel") {
        const file = await getExportWorkbook();
        if (!file) {
          toast.error("Không có quyền xuất dữ liệu");
          return;
        }
        downloadBase64File(
          file.filename,
          file.base64,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        toast.success("Đã xuất báo cáo thành công");
        return;
      }

      const data = await getExportData();

      const devicesFormatted = data.devices.map((d) => ({
        "Mã QR": d.qrCode,
        "Tên thiết bị": d.name,
        Loại: d.type,
        "Trạng thái": d.status,
        Phòng: d.room.name,
        "Số Serial": d.serialNumber || "",
        "Ngày tạo": format(new Date(d.createdAt), "dd/MM/yyyy HH:mm"),
      }));

      const ticketsFormatted = data.tickets.map((t) => ({
        "Mã Ticket": t.id,
        "Tiêu đề": t.title,
        "Trạng thái": t.status,
        "Mức độ": t.priority,
        "Danh mục": t.category,
        "Người tạo": t.creator.name,
        "Người xử lý": t.assignee?.name || "",
        "Thiết bị": t.device?.name || "",
        "Ngày tạo": format(new Date(t.createdAt), "dd/MM/yyyy HH:mm"),
        "Ngày giải quyết": t.resolvedAt ? format(new Date(t.resolvedAt), "dd/MM/yyyy HH:mm") : "",
      }));

      downloadCsv(`${baseName}-ThietBi.csv`, toCsv(devicesFormatted));
      downloadCsv(`${baseName}-Tickets.csv`, toCsv(ticketsFormatted));
      toast.success("Đã xuất báo cáo thành công");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1"
      >
        <Download className="mr-2 h-4 w-4" />
        {loading ? "Đang xuất..." : "Xuất báo cáo"}
        <ChevronDown className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          CSV (2 file)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
