"use client";

import { useEffect, useState } from "react";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "@/app/actions/notification-actions";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  linkUrl: string | null;
  createdAt: Date;
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

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function fetchNotifications() {
    try {
      const data = await getUnreadNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // ponytail: polling 15s — chỉ gọi khi tab đang hiển thị để tránh request thừa
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    const interval = setInterval(onVisible, 15000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function handleMarkAll() {
    await markAllAsRead();
    setNotifications([]);
  }

  async function handleClick(notif: Notification) {
    await markAsRead(notif.id);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
        <span className="sr-only">Thông báo</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(20rem,90vw)]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Thông báo mới</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAll} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không có thông báo mới.
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer whitespace-normal"
                onClick={() => handleClick(notif)}
              >
                <div className="flex justify-between w-full items-start gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${typeStyle[notif.type ?? "GENERAL"] ?? typeStyle.GENERAL}`} />
                    <span className="font-semibold text-sm leading-none">{notif.title}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {format(new Date(notif.createdAt), "HH:mm dd/MM")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { setOpen(false); router.push("/dashboard/notifications"); }} className="justify-center text-xs text-muted-foreground">
          Xem tất cả thông báo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
