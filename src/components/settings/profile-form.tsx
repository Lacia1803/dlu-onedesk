"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSettingsSchema, UserSettingsValues } from "@/lib/validations/user-settings";
import { updateUserSettings } from "@/app/actions/user-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(initialData.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    values: {
      name: initialData.name,
      phone: initialData.phone || "",
      avatar: initialData.avatar || "",
    },
  });

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ hỗ trợ JPEG, PNG, WEBP.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/user/avatar/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setAvatar(data.url);
        setValue("avatar", data.url);
        toast.success("Đã tải ảnh đại diện lên.");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi khi tải ảnh.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: UserSettingsValues) {
    setLoading(true);
    const res = await updateUserSettings(data);
    setLoading(false);
    if (res.success) {
      toast.success("Cập nhật thành công!");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Accordion defaultValue={["profile"]} className="w-full">
      <AccordionItem value="profile">
        <AccordionTrigger className="font-mono text-sm uppercase">Thông tin cá nhân</AccordionTrigger>
        <AccordionContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatar || ""} />
                <AvatarFallback>{initialData.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Thay đổi
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setAvatar(""); setValue("avatar", ""); }} className="text-destructive">
                    Xóa
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={initialData.email} disabled className="bg-muted font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Tên</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input {...register("phone")} placeholder="+84987654321" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="mt-4">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu thay đổi
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
