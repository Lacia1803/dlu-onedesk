"use client";

import { useState } from "react";
import { updateTicket } from "@/app/actions/ticket-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, CheckCircle2 } from "lucide-react";

interface TicketActionsMenuProps {
  ticket: any;
  technicians: { id: string; name: string }[];
  isTech: boolean;
}

export function TicketActionsMenu({ ticket, technicians, isTech }: TicketActionsMenuProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate(field: string, value: string) {
    setLoading(true);
    const res = await updateTicket(ticket.id, { [field]: value });
    setLoading(false);

    if (res.success) {
      toast.success("Đã cập nhật ticket.");
    } else {
      toast.error(res.error);
    }
  }

  // User view
  if (!isTech) {
    if (ticket.status === "CLOSED") return null;
    return (
      <Button 
        variant="outline" 
        disabled={loading} 
        onClick={() => handleUpdate("status", "CLOSED")}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Đóng Ticket
      </Button>
    );
  }

  // Tech/Admin view
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {/* Assignee */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground outline-none" disabled={loading || ticket.status === "CLOSED"}>
          Người xử lý: {ticket.assignee?.name || "Chưa chọn"}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Phân công cho</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={ticket.assigneeId || ""} onValueChange={(val) => handleUpdate("assigneeId", val)}>
            <DropdownMenuRadioItem value="">Bỏ phân công</DropdownMenuRadioItem>
            {technicians.map(t => (
              <DropdownMenuRadioItem key={t.id} value={t.id}>{t.name}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground outline-none" disabled={loading}>
          Trạng thái: {ticket.status}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Đổi trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={ticket.status} onValueChange={(val) => handleUpdate("status", val)}>
            <DropdownMenuRadioItem value="OPEN">Mở</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="IN_PROGRESS">Đang xử lý</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="WAITING_PARTS">Chờ linh kiện</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="RESOLVED">Đã xử lý</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="CLOSED">Đóng</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground outline-none" disabled={loading || ticket.status === "CLOSED"}>
          Mức độ: {ticket.priority}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Đổi mức độ ưu tiên</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={ticket.priority} onValueChange={(val) => handleUpdate("priority", val)}>
            <DropdownMenuRadioItem value="LOW">Thấp</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="MEDIUM">Trung bình</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="HIGH">Cao</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="URGENT">Khẩn cấp</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
