"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteDevice } from "@/app/actions/device-actions";
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

export function DeleteDeviceButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteDevice(id);
    setLoading(false);
    if (res.success) {
      toast.success("Đã xóa thiết bị.");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
        aria-label="Xóa thiết bị"
        title="Xóa thiết bị"
      >
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa thiết bị?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa thiết bị này? Hành động này sẽ ẩn thiết bị khỏi hệ thống.
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
