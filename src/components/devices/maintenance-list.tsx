"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema, MaintenanceFormValues } from "@/lib/validations/device";
import { addMaintenanceLog } from "@/app/actions/device-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface MaintenanceListProps {
  deviceId: string;
  logs: any[];
  canEdit: boolean;
}

export function MaintenanceList({ deviceId, logs, canEdit }: MaintenanceListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: {
      type: "",
      description: "",
      cost: 0,
      performedAt: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);
    const res = await addMaintenanceLog(deviceId, data);
    setLoading(false);

    if (res.success) {
      toast.success("Đã thêm lịch sử bảo trì");
      setOpen(false);
      reset();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Lịch sử bảo trì & sửa chữa</h3>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Thêm lịch sử
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm lịch sử bảo trì</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Loại bảo trì * (VD: Sửa chữa, Vệ sinh, Nâng cấp)</Label>
                  <Input {...register("type")} />
                  {errors.type && <p className="text-sm text-destructive">{errors.type?.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Mô tả chi tiết *</Label>
                  <Textarea {...register("description")} rows={3} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description?.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Chi phí (VNĐ)</Label>
                    <Input type="number" {...register("cost")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày thực hiện *</Label>
                    <Input type="date" {...register("performedAt")} />
                    {errors.performedAt && <p className="text-sm text-destructive">{errors.performedAt?.message as string}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-md divide-y">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">Chưa có lịch sử bảo trì.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{log.type}</h4>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(log.performedAt), "dd/MM/yyyy")}
                </span>
              </div>
              <p className="text-sm">{log.description}</p>
              {log.cost > 0 && (
                <p className="text-sm text-muted-foreground">Chi phí: {log.cost.toLocaleString("vi-VN")} VNĐ</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
