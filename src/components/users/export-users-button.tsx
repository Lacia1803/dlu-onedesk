"use client";

import { useState } from "react";
import { getUsersExportData } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { format } from "date-fns";

const COLUMNS = [
  { key: "name", label: "Tên" },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai trò" },
  { key: "phone", label: "Số điện thoại" },
  { key: "createdAt", label: "Ngày tham gia" },
  { key: "deletedAt", label: "Trạng thái" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

export function ExportUsersButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formatType, setFormatType] = useState<"xlsx" | "csv">("xlsx");
  const [selected, setSelected] = useState<ColumnKey[]>(
    COLUMNS.map((c) => c.key)
  );

  function toggleColumn(key: ColumnKey) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleExport() {
    if (selected.length === 0) {
      toast.error("Chọn ít nhất một cột để xuất.");
      return;
    }
    try {
      setLoading(true);
      const data = await getUsersExportData();
      if (!data) {
        toast.error("Không có quyền xuất dữ liệu.");
        return;
      }

      const rows = data.map((u: Record<string, unknown>) => {
        const row: Record<string, string> = {};
        for (const key of selected) {
          const v = u[key];
          if (key === "createdAt") row["Ngày tham gia"] = format(new Date(v as string), "dd/MM/yyyy HH:mm");
          else if (key === "deletedAt") row["Trạng thái"] = v ? "Đã vô hiệu hóa" : "Hoạt động";
          else if (key === "phone") row["Số điện thoại"] = (v as string) || "";
          else row[COLUMNS.find((c) => c.key === key)!.label] = (v as string) || "";
        }
        return row;
      });

      const stamp = format(new Date(), "yyyyMMdd_HHmm");
      if (formatType === "xlsx") {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, `Users_Report_${stamp}.xlsx`);
      } else {
        const ws = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(["" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Users_Report_${stamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Đã xuất ${rows.length} người dùng.`);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 font-mono text-xs uppercase tracking-wider hover:bg-secondary"
        disabled={loading}
      >
        <Download className="h-4 w-4" />
        Xuất người dùng
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-wider">
            <span className="text-primary">▶</span> EXPORT USERS
          </DialogTitle>
          <DialogDescription>Chọn định dạng và cột dữ liệu cần xuất.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={formatType === "xlsx" ? "default" : "outline"}
              onClick={() => setFormatType("xlsx")}
            >
              Excel (.xlsx)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={formatType === "csv" ? "default" : "outline"}
              onClick={() => setFormatType("csv")}
            >
              CSV (.csv)
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {COLUMNS.map((col) => (
              <Label key={col.key} className="flex items-center gap-2 font-normal">
                <Checkbox
                  checked={selected.includes(col.key)}
                  onCheckedChange={() => toggleColumn(col.key)}
                />
                {col.label}
              </Label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Đang xuất..." : "Xuất file"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
