"use client";

import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { rateTicket, reopenTicket } from "@/app/actions/ticket-actions";

interface RatingWidgetProps {
  ticketId: string;
  rating: number | null;
  feedback: string | null;
  canReopen?: boolean;
}

export function RatingWidget({ ticketId, rating = 0, feedback, canReopen = false }: RatingWidgetProps) {
  const router = useRouter();
  const [hover, setHover] = useState(0);
  const [value, setValue] = useState<number>(rating || 0);
  const [text, setText] = useState(feedback || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const res = await rateTicket(ticketId, value, text);
    setLoading(false);
    if (res.success) toast.success("Đã gửi đánh giá");
    else toast.error(res.error || "Gửi đánh giá thất bại");
  };

  const handleReopen = async () => {
    setLoading(true);
    const res = await reopenTicket(ticketId);
    setLoading(false);
    if (res.success) {
      toast.success("Đã mở lại ticket");
      router.refresh();
    } else toast.error(res.error || "Không mở lại được");
  };

  return (
    <div className="border rounded-md bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50"
            }`}
            onClick={() => setValue(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          />
        ))}
        <span className="text-sm font-medium">{value > 0 ? `${value}/5 sao` : "Chưa có đánh giá"}</span>
      </div>

      <Textarea
        placeholder="Bạn nghĩ gì về dịch vụ này? (tùy chọn)"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading || value === 0}>
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
        {canReopen && (
          <Button size="sm" variant="outline" onClick={handleReopen} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Mở lại ticket
          </Button>
        )}
      </div>
    </div>
  );
}