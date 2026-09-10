"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

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

export default function NotificationCenter() {
  const [filter, setFilter] = useState("ALL");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications() {
    const res = await fetch(`/api/notifications?filter=${filter}`);
    if (res.ok) setNotifications(await res.json());
  }

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Thông báo</h1>
      <div className="mb-4 flex gap-2">
        {["ALL", "UNREAD", "TICKET_ASSIGNED", "TICKET_STATUS", "TICKET_COMMENT", "SLA_WARNING", "MAINTENANCE", "FAQ", "GENERAL"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${typeStyle[n.type ?? "GENERAL"] ?? typeStyle.GENERAL}`} />
                <span className="font-semibold">{n.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(n.createdAt), "HH:mm dd/MM")}
              </span>
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
    </div>
  );
}
