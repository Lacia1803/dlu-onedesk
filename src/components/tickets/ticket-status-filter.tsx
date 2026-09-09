"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function TicketStatusFilter({
  currentStatus,
  currentPriority,
  keyword,
}: {
  currentStatus?: string;
  currentPriority?: string;
  keyword?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(Array.from(params.entries()));
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
      else newParams.delete(k);
    });
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      {/* Search box */}
      <div className="flex-1 relative">
        <Input
          placeholder="Tìm kiếm (tiêu đề, mô tả, ID)"
          defaultValue={keyword || ""}
          className="pl-8"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              const target = e.currentTarget as HTMLInputElement;
              update({ q: target.value.trim() || undefined });
            }
          }}
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Status filter */}
      <Select value={currentStatus || ""} onValueChange={v => update({ status: v || undefined })}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="OPEN">Mở</SelectItem>
          <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
          <SelectItem value="WAITING_PARTS">Chờ linh kiện</SelectItem>
          <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
          <SelectItem value="CLOSED">Đóng</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select value={currentPriority || ""} onValueChange={v => update({ priority: v || undefined })}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Mức độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả</SelectItem>
          <SelectItem value="LOW">Thấp</SelectItem>
          <SelectItem value="MEDIUM">Trung bình</SelectItem>
          <SelectItem value="HIGH">Cao</SelectItem>
          <SelectItem value="URGENT">Khẩn cấp</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset button */}
      <Button variant="outline" onClick={() => update({ q: undefined, status: undefined, priority: undefined })}>
        Reset
      </Button>
    </div>
  );
}
