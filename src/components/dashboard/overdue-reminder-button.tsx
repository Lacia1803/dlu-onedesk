"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendOverdueReminder } from "@/app/actions/overdue-actions";
import { toast } from "sonner";
import { MailWarning } from "lucide-react";

export function OverdueReminderButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await sendOverdueReminder();
    setLoading(false);
    if (res.success) {
      toast.success(`Đã gửi reminder cho ${res.sent || 0} ticket quá hạn.`);
    } else {
      toast.error(res.error || "Gửi reminder thất bại");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <MailWarning className="mr-2 h-4 w-4" />
      {loading ? "Đang gửi..." : "Gửi reminder quá hạn"}
    </Button>
  );
}
