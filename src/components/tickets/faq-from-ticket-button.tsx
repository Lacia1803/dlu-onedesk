"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createFaqDraftFromTicket } from "@/app/actions/faq-from-ticket";
import { toast } from "sonner";
import { BookPlus } from "lucide-react";

export function FaqFromTicketButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    try {
      setLoading(true);
      const res = await createFaqDraftFromTicket(ticketId);
      if (res.success) toast.success("Đã tạo bản nháp FAQ, chờ Admin duyệt");
      else toast.error(res.error || "Tạo thất bại");
    } catch {
      toast.error("Lỗi khi tạo bản nháp FAQ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCreate} disabled={loading}>
      <BookPlus className="mr-2 h-4 w-4" />
      {loading ? "Đang tạo..." : "Tạo FAQ từ ticket"}
    </Button>
  );
}
