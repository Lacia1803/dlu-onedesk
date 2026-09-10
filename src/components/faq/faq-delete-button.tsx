"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteFaq } from "@/app/actions/faq-actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FaqDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteFaq(id);
    setLoading(false);
    if (res.success) {
      toast.success("Đã xóa câu hỏi.");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2" aria-label="Xóa FAQ" title="Xóa">
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa câu hỏi FAQ?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa câu hỏi này? Dữ liệu bị xóa không thể khôi phục.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
