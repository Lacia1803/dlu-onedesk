"use client";

import { useState } from "react";
import { getExportData } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const data = await getExportData();
      
      const wb = XLSX.utils.book_new();

      // Format Devices
      const devicesFormatted = data.devices.map(d => ({
        "Mã QR": d.qrCode,
        "Tên thiết bị": d.name,
        "Loại": d.type,
        "Trạng thái": d.status,
        "Phòng": d.room.name,
        "Số Serial": d.serialNumber || "",
        "Ngày tạo": format(new Date(d.createdAt), "dd/MM/yyyy HH:mm")
      }));
      const wsDevices = XLSX.utils.json_to_sheet(devicesFormatted);
      XLSX.utils.book_append_sheet(wb, wsDevices, "Thiết bị");

      // Format Tickets
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
      const wsTickets = XLSX.utils.json_to_sheet(ticketsFormatted);
      XLSX.utils.book_append_sheet(wb, wsTickets, "Tickets");

      XLSX.writeFile(wb, `BaoCao-ITHelpdesk-${format(new Date(), "yyyyMMdd")}.xlsx`);
      toast.success("Đã xuất báo cáo thành công");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
