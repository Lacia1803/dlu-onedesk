"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, RoomFormValues } from "@/lib/validations/room";
import { createRoom, updateRoom } from "@/app/actions/room-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Room } from "@prisma/client";

interface RoomFormProps {
  initialData?: Room | null;
}

export function RoomForm({ initialData }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RoomFormValues>({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên phòng máy</FormLabel>
              <FormControl>
                <Input placeholder="Lab CNTT 1" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí</FormLabel>
                <FormControl>
                  <Input placeholder="Tầng 1, Nhà A" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sức chứa (Máy)</FormLabel>
                <FormControl>
                  <Input type="number" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả chi tiết</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm về phòng máy này..." disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo mới")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
