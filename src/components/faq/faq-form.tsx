"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqFormValues } from "@/lib/validations/faq";
import { createFaq, updateFaq } from "@/app/actions/faq-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";
import type { FaqRecord } from "@/types";

interface FaqFormProps {
  initialData?: FaqRecord;
}

export function FaqForm({ initialData }: FaqFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema) as Resolver<FaqFormValues>,
    defaultValues: {
      question: initialData?.question || "",
      answer: initialData?.answer || "",
      category: initialData?.category || "",
      isActive: initialData ? initialData.isActive : true,
    },
  });

  const isActive = watch("isActive");

  async function onSubmit(data: FaqFormValues) {
    setLoading(true);
    let res;
    if (initialData) {
      res = await updateFaq(initialData.id, data);
    } else {
      res = await createFaq(data);
    }
    setLoading(false);

    if (res.success) {
      toast.success(initialData ? "Cập nhật thành công!" : "Tạo thành công!");
      setOpen(false);
      if (!initialData) reset();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ${initialData ? "h-9 w-9 border border-input hover:bg-accent hover:text-accent-foreground" : "h-10 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"}`}
      >
        {initialData ? (
          <Edit className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi mới
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi FAQ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="question">Câu hỏi *</Label>
            <Input
              id="question"
              {...register("question")}
              placeholder="VD: Làm sao để cài máy in?"
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question?.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Danh mục *</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="VD: Phần mềm, Máy in, Mạng..."
            />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category?.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Câu trả lời / Hướng dẫn *</Label>
            <Textarea
              id="answer"
              {...register("answer")}
              rows={6}
              placeholder="Nhập các bước hướng dẫn xử lý..."
            />
            {errors.answer && (
              <p className="text-sm text-destructive">{errors.answer?.message as string}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Hiển thị (Active)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
