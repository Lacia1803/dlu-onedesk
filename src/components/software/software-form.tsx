"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { softwareSchema, type SoftwareFormValues } from "@/lib/validations/software";
import { createSoftware, updateSoftware } from "@/app/actions/software-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Software } from "@prisma/client";

interface SoftwareFormProps {
  initialData?: Software | null;
}

export function SoftwareForm({ initialData }: SoftwareFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(softwareSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      version: initialData.version || "",
      license: initialData.license || "",
    } : {
      name: "",
      version: "",
      license: "",
    },
  });

  async function onSubmit(data: SoftwareFormValues) {
    setLoading(true);
    const result = initialData
      ? await updateSoftware(initialData.id, data)
      : await createSoftware(data);

    setLoading(false);

    if (result.success) {
      toast.success(initialData ? "Đã cập nhật phần mềm!" : "Đã tạo phần mềm!");
      router.push("/dashboard/software");
      router.refresh();
    } else {
      toast.error(result.error || "Đã xảy ra lỗi");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div>
        <label className="text-sm font-medium">Tên phần mềm</label>
        <Input placeholder="Microsoft Office, Visual Studio Code..." disabled={loading} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Phiên bản</label>
          <Input placeholder="2024, 1.85.0..." disabled={loading} {...register("version")} />
          {errors.version && <p className="text-sm text-destructive">{errors.version.message as string}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Giấy phép</label>
          <Input placeholder="MIT, Commercial, Free..." disabled={loading} {...register("license")} />
          {errors.license && <p className="text-sm text-destructive">{errors.license.message as string}</p>}
        </div>
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
