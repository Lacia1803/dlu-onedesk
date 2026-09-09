"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { TicketStatus, TicketPriority } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/status-badge";
import { bulkUpdateTickets, assignTicketToMe, autoAssignTicket } from "@/app/actions/ticket-actions";
import { CheckCheck, XSquare } from "lucide-react";

interface TicketItem {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date | string;
  creator: { name: string };
  assignee: { name: string } | null;
}

interface BulkTicketTableProps {
  tickets: TicketItem[];
  isUser: boolean;
}

export function BulkTicketTable({ tickets, isUser }: BulkTicketTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const allSelected = tickets.length > 0 && selectedIds.length === tickets.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tickets.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status: TicketStatus) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    const res = await bulkUpdateTickets(selectedIds, { status });
    setLoading(false);
    if (res.success) {
      toast.success(`Đã cập nhật trạng thái cho ${selectedIds.length} ticket.`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(res.error || "Không thể cập nhật.");
    }
  };

  const handleBulkPriority = async (priority: TicketPriority) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    const res = await bulkUpdateTickets(selectedIds, { priority });
    setLoading(false);
    if (res.success) {
      toast.success(`Đã cập nhật mức ưu tiên cho ${selectedIds.length} ticket.`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(res.error || "Không thể cập nhật.");
    }
  };

  return (
    <div className="space-y-3">
      {!isUser && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-primary/40 bg-primary/5 p-3">
          <div className="flex items-center gap-2 font-mono text-xs text-primary">
            <CheckCheck className="h-4 w-4" />
            <span>Đã chọn <strong>{selectedIds.length}</strong> ticket</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={(val) => handleBulkStatus(val as TicketStatus)} disabled={loading}>
              <SelectTrigger className="h-8 w-[160px] text-xs font-mono">
                <SelectValue placeholder="Đổi trạng thái..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Chờ xử lý (OPEN)</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                <SelectItem value="WAITING_PARTS">Chờ linh kiện</SelectItem>
                <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                <SelectItem value="CLOSED">Đóng ticket</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(val) => handleBulkPriority(val as TicketPriority)} disabled={loading}>
              <SelectTrigger className="h-8 w-[150px] text-xs font-mono">
                <SelectValue placeholder="Đổi ưu tiên..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Thấp (LOW)</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="HIGH">Cao</SelectItem>
                <SelectItem value="URGENT">Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-mono"
              onClick={() => setSelectedIds([])}
              disabled={loading}
            >
              <XSquare className="h-3.5 w-3.5 mr-1" />
              Bỏ chọn
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-mono bg-primary/10 text-primary hover:bg-primary/20"
              onClick={async () => {
                setLoading(true);
                let count = 0;
                for (const id of selectedIds) {
                  const res = await autoAssignTicket(id);
                  if (res.success) count++;
                }
                setLoading(false);
                toast.success(`Đã tự động gán ${count}/${selectedIds.length} ticket cho kỹ thuật viên ít việc nhất.`);
                setSelectedIds([]);
                router.refresh();
              }}
              disabled={loading}
            >
              Tự động gán ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-sm border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {!isUser && (
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={tickets.length === 0}
                  />
                </TableHead>
              )}
              <TableHead>Mã</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mức độ</TableHead>
              {!isUser && <TableHead>Người tạo</TableHead>}
              <TableHead>Người xử lý</TableHead>
              <TableHead>Ngày tạo</TableHead>
              {!isUser && <TableHead className="w-[110px]">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isUser ? 6 : 9} className="text-center py-6 text-muted-foreground font-mono text-xs">
                  Không có dữ liệu ticket
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const isSelected = selectedIds.includes(ticket.id);
                return (
                  <TableRow
                    key={ticket.id}
                    className={isSelected ? "bg-primary/5" : undefined}
                  >
                    {!isUser && (
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(ticket.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{ticket.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <Link
                        href={`/dashboard/tickets/${ticket.id}`}
                        className="hover:underline text-primary"
                      >
                        {ticket.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </TableCell>
                    {!isUser && <TableCell>{ticket.creator.name}</TableCell>}
                    <TableCell>
                      {ticket.assignee?.name || (
                        <span className="text-muted-foreground italic">Chưa phân công</span>
                      )}
                    </TableCell>
                    {!isUser && (
                      <TableCell>
                        {!ticket.assignee && ticket.status !== "CLOSED" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            className="font-mono uppercase tracking-wider"
                            onClick={async () => {
                              const res = await assignTicketToMe(ticket.id);
                              if (res.success) {
                                toast.success("Đã nhận xử lý ticket.");
                                router.refresh();
                              } else {
                                toast.error(res.error || "Không nhận được ticket.");
                              }
                            }}
                          >
                            Nhận xử lý
                          </Button>
                        ) : null}
                      </TableCell>
                    )}
                    <TableCell>
                      {format(new Date(ticket.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
