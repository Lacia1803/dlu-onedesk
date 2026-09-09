"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, TicketFormValues } from "@/lib/validations/ticket";
import { createTicket } from "@/app/actions/ticket-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Lightbulb } from "lucide-react";

interface DeviceOption {
  id: string;
  name: string;
  qrCode: string;
}

interface FaqOption {
  id: string;
  question: string;
  answer: string;
}

interface TicketFormProps {
  devices: DeviceOption[];
  initialDeviceId?: string;
  faqs?: FaqOption[];
}

const CATEGORY_OPTIONS = [
  { value: "HARDWARE", label: "Phần cứng" },
  { value: "SOFTWARE", label: "Phần mềm" },
  { value: "NETWORK", label: "Mạng" },
  { value: "PERIPHERAL", label: "Ngoại vi" },
  { value: "OTHER", label: "Khác" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn cấp" },
];

export function TicketForm({ devices, initialDeviceId, faqs = [] }: TicketFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(ticketSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
      priority: "MEDIUM",
      deviceId: initialDeviceId || "",
    },
  });

  const title = watch("title");

  // Suggest FAQs based on title input
  const suggestedFaqs = useMemo(() => {
    if (!title || title.length < 5) return [];
    const keywords = title.toLowerCase().split(/\s+/).filter((k: string) => k.length > 2);
    if (keywords.length === 0) return [];
    
    return faqs.filter(faq => 
      keywords.some((k: string) => faq.question.toLowerCase().includes(k))
    ).slice(0, 3); // Max 3 suggestions
  }, [title, faqs]);

  async function onSubmit(data: any) {
    setLoading(true);
    const res = await createTicket(data);
    setLoading(false);

    if (res.success) {
      toast.success("Đã tạo báo cáo sự cố thành công!");
      router.push(`/dashboard/tickets/${res.ticketId}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border">
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề (Tóm tắt sự cố) *</Label>
        <Input id="title" {...register("title")} placeholder="VD: Máy tính không lên nguồn" />
        {errors.title && <p className="text-sm text-destructive">{errors.title?.message as string}</p>}
      </div>

      {suggestedFaqs.length > 0 && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2 font-medium">
            <Lightbulb className="h-5 w-5" />
            <span>Gợi ý cách tự khắc phục (Cẩm nang FAQ):</span>
          </div>
          <Accordion type="single" collapsible className="w-full bg-white/50 rounded-md">
            {suggestedFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b-blue-100 last:border-0 px-3">
                <AccordionTrigger className="text-sm hover:no-underline hover:text-blue-800 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Danh mục *</Label>
          <Select defaultValue="OTHER" onValueChange={(val: any) => setValue("category", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category?.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Mức độ ưu tiên *</Label>
          <Select defaultValue="MEDIUM" onValueChange={(val: any) => setValue("priority", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn mức độ" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-sm text-destructive">{errors.priority?.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deviceId">Thiết bị liên quan (Tùy chọn)</Label>
        <Select defaultValue={initialDeviceId || ""} onValueChange={(val) => setValue("deviceId", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Không chọn thiết bị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">-- Không chọn --</SelectItem>
            {devices.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name} ({d.qrCode})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả chi tiết *</Label>
        <Textarea id="description" {...register("description")} rows={5} placeholder="Mô tả rõ tình trạng bạn đang gặp phải..." />
        {errors.description && <p className="text-sm text-destructive">{errors.description?.message as string}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </Button>
      </div>
    </form>
  );
}
