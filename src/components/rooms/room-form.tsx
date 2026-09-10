"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomFormValues } from "@/lib/validations/room";
import { createRoom, updateRoom } from "@/app/actions/room-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Room } from "@prisma/client";

interface RoomFormProps {
  initialData?: Room | null;
}

export function RoomForm({ initialData }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      location: initialData.location,
      capacity: initialData.capacity,
      description: initialData.description || "",
    } : {
      name: "",
      location: "",
      capacity: 30,
      description: "",
    },
  });

  async function onSubmit(data: RoomFormValues) {
    setLoading(true);
    const result = initialData
      ? await updateRoom(initialData.id, data)
      : await createRoom(data);

    setLoading(false);

    if (result.success) {
      toast.success(initialData ? "Đã cập nhật phòng máy!" : "Đã tạo phòng máy!");
      router.push("/dashboard/rooms");
      router.refresh();
    } else {
      toast.error(result.error || "Đã xảy ra lỗi");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div>
        <label className="text-sm font-medium">Tên phòng máy</label>
        <Input placeholder="Lab CNTT 1" disabled={loading} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Vị trí</label>
          <Input placeholder="Tầng 1, Nhà A" disabled={loading} {...register("location")} />
          {errors.location && <p className="text-sm text-destructive">{errors.location.message as string}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Sức chứa (Máy)</label>
          <Input type="number" disabled={loading} {...register("capacity")} />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message as string}</p>}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Mô tả chi tiết</label>
        <Textarea placeholder="Ghi chú thêm về phòng máy này..." disabled={loading} {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message as string}</p>}
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo mới")}
        </Button>
      </div>
    </form>
  );
}
