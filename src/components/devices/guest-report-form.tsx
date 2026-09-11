"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { guestTicketSchema, type GuestTicketValues } from "@/lib/validations/guest-ticket";

interface Props {
  deviceId: string;
  deviceName: string;
}

export function GuestReportForm({ deviceId }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestTicketValues>({
    resolver: zodResolver(guestTicketSchema),
    defaultValues: {
      studentId: "",
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: GuestTicketValues) {
    setLoading(true);
    const res = await fetch("/api/tickets/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, deviceId }),
    });
    const result = await res.json();
    setLoading(false);

    if (result.success) {
      toast.success("Đã gửi báo cáo thành công!");
      setSubmitted(true);
      setTicketId(result.ticketId);
    } else {
      toast.error(result.error || "Gửi không thành công.");
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <CardTitle>Cảm ơn bạn!</CardTitle>
          <CardDescription>
            Báo cáo đã được ghi nhận. Kỹ thuật viên sẽ xử lý sớm nhất.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground space-y-4">
          <p>
            Mã ticket: <code className="font-mono text-base font-bold text-foreground">#{ticketId.slice(-6).toUpperCase()}</code>
          </p>
          <div className="pt-2">
            <Link
              href={`/tickets/track?q=${ticketId}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold px-4 py-2 w-full text-center hover:bg-primary/90 text-sm"
            >
              Theo dõi tiến độ xử lý trực tiếp →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Thông tin sự cố
        </CardTitle>
        <CardDescription>
          Nhập mã sinh viên và mô tả lỗi để chúng tôi có thể liên hệ bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Mã sinh viên / Họ tên *</Label>
            <Input
              id="studentId"
              {...register("studentId")}
              placeholder="VD: B20DCCN001 hoặc Nguyễn Văn A"
            />
            {errors.studentId && (
              <p className="text-sm text-destructive">{errors.studentId?.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề sự cố *</Label>
            <Input id="title" {...register("title")} placeholder="VD: Máy không lên nguồn" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title?.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết *</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              placeholder="Mô tả rõ tình trạng bạn đang gặp phải..."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description?.message as string}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
