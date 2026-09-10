"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { markAllAsRead, deleteNotification } from "@/app/actions/notification-actions";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  linkUrl: string | null;
  createdAt: string; // ISO string
}

const typeStyle: Record<string, string> = {
  TICKET_ASSIGNED: "bg-blue-500",
  TICKET_STATUS: "bg-purple-500",
  TICKET_COMMENT: "bg-green-500",
  SLA_WARNING: "bg-red-500",
  MAINTENANCE: "bg-amber-500",
  FAQ: "bg-teal-500",
  GENERAL: "bg-gray-400",
};

export const typeLabel: Record<string, string> = {
  ALL: "Tất cả",
  UNREAD: "Chưa đọc",
  TICKET_ASSIGNED: "Phân công",
  TICKET_STATUS: "Trạng thái",
  TICKET_COMMENT: "Bình luận",
  SLA_WARNING: "Cảnh báo SLA",
  MAINTENANCE: "Bảo trì",
  FAQ: "Hỏi đáp",
  GENERAL: "Chung",
};

export const typeTooltip: Record<string, string> = {
  TICKET_ASSIGNED: "Ticket được gán cho bạn",
  TICKET_STATUS: "Trạng thái ticket thay đổi",
  TICKET_COMMENT: "Có bình luận mới trong ticket",
  SLA_WARNING: "Ticket sắp hoặc đã quá hạn xử lý",
  MAINTENANCE: "Nhắc việc bảo trì thiết bị",
  FAQ: "FAQ mới hoặc chờ duyệt",
  GENERAL: "Thông báo chung",
};

export default function NotificationCenter() {
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<{ unread: number; openTickets: number; pendingFaqs: number } | null>(null);

  async function fetchNotifications() {
    const res = await fetch(`/api/notifications?filter=${filter}&page=${page}&stats=true`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setTotalPages(0);
      } else {
        setNotifications(data.items);
        setTotalPages(data.totalPages);
        if (data.stats) setStats(data.stats);
      }
    }
  }

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  function changeFilter(f: string) {
    setFilter(f);
    setPage(1);
  }

  async function handleMarkAll() {
    const res = await markAllAsRead();
    if (res.success) {
      toast.success("Đã đánh dấu tất cả là đã đọc");
      fetchNotifications();
    } else {
      toast.error("Thất bại, thử lại sau");
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteNotification(id);
    if (res.success) {
      toast.success("Đã xóa thông báo");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else {
      toast.error("Xóa thất bại");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <Button variant="outline" size="sm" onClick={handleMarkAll}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-card">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Chưa đọc</p>
            <p className="text-2xl font-bold mt-1">{stats.unread}</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ticket chờ xử lý</p>
            <p className="text-2xl font-bold mt-1">{stats.openTickets}</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">FAQ chờ duyệt</p>
            <p className="text-2xl font-bold mt-1">{stats.pendingFaqs}</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap">
        {Object.keys(typeLabel).map((f) => (
          <button
            key={f}
            title={typeTooltip[f] ?? f}
            onClick={() => changeFilter(f)}
            className={`px-3 py-1 rounded ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {typeLabel[f]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  title={typeTooltip[n.type ?? "GENERAL"] ?? n.type}
                  className={`inline-block h-2 w-2 rounded-full ${typeStyle[n.type ?? "GENERAL"] ?? typeStyle.GENERAL}`}
                />
                <span className="font-semibold">{n.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {typeLabel[n.type ?? "GENERAL"] ?? n.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(n.createdAt), "HH:mm dd/MM")}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                  aria-label="Xóa thông báo"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            {n.linkUrl && (
              <a href={n.linkUrl} className="mt-2 inline-block text-primary underline">
                Xem chi tiết
              </a>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-muted-foreground">Không có thông báo.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
