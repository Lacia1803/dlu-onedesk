"use client";

import { useState } from "react";
import { getExportData } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
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
    return [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");
  }

  function downloadCsv(name: string, content: string) {
    // ponytail: BOM cho Excel mở tiếng Việt đúng; bỏ khi chỉ dùng UTF-8 reader
    const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExport(formatType: "excel" | "csv") {
    try {
      setLoading(true);
      const data = await getExportData();

      const devicesFormatted = data.devices.map(d => ({
        "Mã QR": d.qrCode,
        "Tên thiết bị": d.name,
        "Loại": d.type,
        "Trạng thái": d.status,
        "Phòng": d.room.name,
        "Số Serial": d.serialNumber || "",
        "Ngày tạo": format(new Date(d.createdAt), "dd/MM/yyyy HH:mm")
      }));

      const ticketsFormatted = data.tickets.map(t => ({
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

      const filename = `BaoCao-ITHelpdesk-${format(new Date(), "yyyyMMdd")}`;

      if (formatType === "csv") {
        downloadCsv(`${filename}-ThietBi.csv`, toCsv(devicesFormatted));
        downloadCsv(`${filename}-Tickets.csv`, toCsv(ticketsFormatted));
      } else {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(devicesFormatted), "Thiết bị");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ticketsFormatted), "Tickets");
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
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
      <DropdownMenuTrigger>
        <Button disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Đang xuất..." : "Xuất báo cáo"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
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
