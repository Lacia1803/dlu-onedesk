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
  linkUrl: string | null;
  createdAt: Date;
}

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
    // Initial fetch
    fetchNotifications();

    // Polling every 15s
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function handleMarkAll() {
    await markAllAsRead();
    setNotifications([]);
  }

  async function handleClick(notif: Notification) {
    // Mark as read
    await markAsRead(notif.id);
    
    // Update local state
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    
    setOpen(false);

    // Navigate
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative outline-none">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
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
                  <span className="font-semibold text-sm leading-none">{notif.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {format(new Date(notif.createdAt), "HH:mm dd/MM")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
