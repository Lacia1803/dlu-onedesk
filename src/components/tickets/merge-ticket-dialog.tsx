"use client";

import { useState } from "react";
import { mergeTickets } from "@/app/actions/ticket-merge-actions";
import { Button } from "@/components/ui/button";
import { GitMerge } from "lucide-react";

export function MergeTicketDialog({ targetTicketId }: { targetTicketId: string }) {
  const [open, setOpen] = useState(false);
  const [duplicateIds, setDuplicateIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMerge() {
    setError(null);
    const ids = duplicateIds
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      setError("Vui lòng nhập ít nhất 1 ID ticket trùng.");
      return;
    }

    setLoading(true);
    const res = await mergeTickets(targetTicketId, ids);
    setLoading(false);

    if (res.success) {
      setOpen(false);
      setDuplicateIds("");
      window.location.reload();
    } else {
      setError(res.error || "Có lỗi xảy ra");
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <GitMerge className="h-4 w-4" />
        Gộp Ticket trùng
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-card p-6 rounded-lg shadow-lg border space-y-4">
        <h3 className="text-lg font-bold">Gộp ticket trùng lặp</h3>
        <p className="text-xs text-muted-foreground">
          Nhập các mã ID ticket cần gộp vào ticket này (cách nhau bằng dấu phẩy hoặc xuống dòng).
          Các ticket này sẽ tự động đóng và điều hướng người tạo về ticket gốc.
        </p>
        <textarea
          rows={3}
          value={duplicateIds}
          onChange={(e) => setDuplicateIds(e.target.value)}
          placeholder="Ví dụ: clu123abc, clu456def..."
          className="w-full rounded border p-2 text-sm bg-background font-mono"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleMerge} disabled={loading}>
            {loading ? "Đang gộp..." : "Xác nhận Gộp"}
          </Button>
        </div>
      </div>
    </div>
  );
}
