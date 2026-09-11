"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { importDevices, importUsers } from "@/app/actions/import-actions";

interface ImportButtonProps {
  label: string; // e.g. "Nhập thiết bị" or "Nhập người dùng"
  subdir: "devices" | "users"; // determines which import action to call
}

export function ImportButton({ label, subdir }: ImportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result =
        subdir === "devices" ? await importDevices(formData) : await importUsers(formData);
      if (result.success) {
        toast.success(`${label} thành công: ${result.inserted} mục, bỏ qua ${result.skipped}`);
      } else {
        toast.error(`${label} lỗi: ${result.errors?.[0]?.message || "Không xác định"}`);
      }
    } catch {
      toast.error(`${label} thất bại`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <Button variant="outline" size="sm" disabled={loading}>
        <Upload className="h-4 w-4 mr-1" />
        {loading ? "Đang nhập..." : label}
      </Button>
      <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleChange} />
    </label>
  );
}
