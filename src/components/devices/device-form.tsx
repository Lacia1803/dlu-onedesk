"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deviceSchema, DeviceFormValues } from "@/lib/validations/device";
import { createDevice, updateDevice } from "@/app/actions/device-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Device } from "@prisma/client";

interface Room {
  id: string;
  name: string;
}

interface DeviceFormProps {
  initialData?: Device | null;
  rooms: Room[];
}

const TYPE_OPTIONS = [
  { value: "COMPUTER", label: "Máy tính" },
  { value: "NETWORK", label: "Thiết bị mạng" },
  { value: "PERIPHERAL", label: "Ngoại vi" },
  { value: "OTHER", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "BROKEN", label: "Hỏng" },
  { value: "MAINTENANCE", label: "Đang bảo trì" },
  { value: "RETIRED", label: "Đã thanh lý" },
];

export function DeviceForm({ initialData, rooms }: DeviceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  let initialSpecs = "";
  if (initialData?.specifications) {
    initialSpecs = typeof initialData.specifications === 'string' 
      ? initialData.specifications 
      : JSON.stringify(initialData.specifications, null, 2);
  }

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "COMPUTER",
      status: initialData?.status || "ACTIVE",
      roomId: initialData?.roomId || "",
      manufacturer: initialData?.manufacturer || "",
      model: initialData?.model || "",
      serialNumber: initialData?.serialNumber || "",
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split("T")[0] : "",
      warrantyEnd: initialData?.warrantyEnd ? new Date(initialData.warrantyEnd).toISOString().split("T")[0] : "",
      specifications: initialSpecs,
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(data: DeviceFormValues) {
    setLoading(true);
    let res;
    if (initialData) {
      res = await updateDevice(initialData.id, data);
    } else {
      res = await createDevice(data);
    }
    setLoading(false);

    if (res.success) {
      toast.success(initialData ? "Đã cập nhật thiết bị" : "Đã thêm thiết bị mới");
      router.push("/dashboard/devices");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên thiết bị *</Label>
          <Input id="name" {...register("name")} placeholder="VD: PC-01" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Room */}
        <div className="space-y-2">
          <Label htmlFor="roomId">Phòng máy *</Label>
          <Select defaultValue={initialData?.roomId ?? ""} onValueChange={(val) => setValue("roomId", val ?? "", { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roomId && <p className="text-sm text-destructive">{errors.roomId.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Loại thiết bị *</Label>
          <Select defaultValue={initialData?.type || "COMPUTER"} onValueChange={(val) => setValue("type", val as DeviceFormValues["type"], { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái *</Label>
          <Select defaultValue={initialData?.status || "ACTIVE"} onValueChange={(val) => setValue("status", val as DeviceFormValues["status"], { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>

        {/* Manufacturer */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Nhà sản xuất</Label>
          <Input id="manufacturer" {...register("manufacturer")} placeholder="VD: Dell" />
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" {...register("model")} placeholder="VD: OptiPlex 7090" />
        </div>

        {/* Serial */}
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Số Serial</Label>
          <Input id="serialNumber" {...register("serialNumber")} />
          {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchase Date */}
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Ngày mua</Label>
          <Input type="date" id="purchaseDate" {...register("purchaseDate")} />
        </div>

        {/* Warranty End */}
        <div className="space-y-2">
          <Label htmlFor="warrantyEnd">Ngày hết hạn bảo hành</Label>
          <Input type="date" id="warrantyEnd" {...register("warrantyEnd")} />
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-2">
        <Label htmlFor="specifications">Cấu hình chi tiết (định dạng JSON)</Label>
        <Textarea 
          id="specifications" 
          {...register("specifications")} 
          placeholder={`{\n  "cpu": "Intel Core i5",\n  "ram": "16GB",\n  "storage": "512GB SSD"\n}`}
          rows={5}
          className="font-mono text-sm"
        />
        {errors.specifications && <p className="text-sm text-destructive">{errors.specifications.message}</p>}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú thêm</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thiết bị"}
        </Button>
      </div>
    </form>
  );
}
