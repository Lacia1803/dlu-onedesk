"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveFaqDraft } from "@/app/actions/faq-from-ticket";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function FaqApproveButtons({ faqId }: { faqId: string }) {
  const [loading, setLoading] = useState(false);

  async function handle(approve: boolean) {
    setLoading(true);
    const res = await approveFaqDraft(faqId, approve);
    setLoading(false);
    if (res.success) toast.success(approve ? "Đã duyệt FAQ" : "Đã từ chối bản nháp");
    else toast.error(res.error || "Thất bại");
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handle(true)} disabled={loading}>
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handle(false)} disabled={loading}>
        <X className="h-4 w-4" />
      </Button>
    </>
  );
}
