"use client";

import { useState } from "react";
import { updateTicket } from "@/app/actions/ticket-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lock, Save } from "lucide-react";

interface InternalNoteSectionProps {
  ticketId: string;
  initialNote: string | null;
}

export function InternalNoteSection({ ticketId, initialNote }: InternalNoteSectionProps) {
  const [note, setNote] = useState(initialNote || "");
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateTicket(ticketId, { internalNote: note });
    setLoading(false);

    if (res.success) {
      toast.success("Đã lưu ghi chú nội bộ");
      setIsSaved(true);
    } else {
      toast.error(res.error || "Không thể lưu ghi chú");
    }
  };

  return (
    <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
          <Lock className="h-3.5 w-3.5" />
          <span>GHI CHÚ NỘI BỘ (CHỈ KỸ THUẬT / ADMIN)</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300"
          onClick={handleSave}
          disabled={loading || isSaved}
        >
          <Save className="h-3 w-3 mr-1" />
          {loading ? "Đang lưu..." : "Lưu ghi chú"}
        </Button>
      </div>

      <Textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setIsSaved(false);
        }}
        placeholder="Nhập thông tin nội bộ: linh kiện cần đặt, tiến độ xử lý ngoài, lý do chậm trễ... (Người tạo ticket sẽ KHÔNG thấy phần này)"
        rows={3}
        className="font-mono text-xs bg-background/50 border-amber-500/20 focus-visible:ring-amber-500/40"
      />
    </div>
  );
}
