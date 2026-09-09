"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Ticket,
  Monitor,
  Server,
  BookOpen,
  Users,
  Settings,
  Disc,
  CalendarDays,
  ScrollText,
  MessagesSquare,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role || "USER";

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", show: true },
    { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", show: true },
    { label: "FAQ", icon: BookOpen, href: "/dashboard/faq", show: true },
    { label: "Lịch sử chat AI", icon: MessagesSquare, href: "/dashboard/chat-history", show: true },
    { label: "Phòng máy", icon: Server, href: "/dashboard/rooms", show: role === "ADMIN" || role === "TECHNICIAN" },
    { label: "Thiết bị", icon: Monitor, href: "/dashboard/devices", show: true },
    { label: "Phần mềm", icon: Disc, href: "/dashboard/software", show: true },
    { label: "KPI của tôi", icon: Gauge, href: "/dashboard/my-kpi", show: role === "ADMIN" || role === "TECHNICIAN" },
    { label: "Bảo trì", icon: CalendarDays, href: "/dashboard/maintenance", show: role === "ADMIN" || role === "TECHNICIAN" },
    { label: "Người dùng", icon: Users, href: "/admin/users", show: role === "ADMIN" },
    { label: "Nhật ký hệ thống", icon: ScrollText, href: "/admin/audit-logs", show: role === "ADMIN" },
    { label: "Cài đặt", icon: Settings, href: "/settings", show: true },
  ];

  return (
    <div className="hidden border-r border-border bg-sidebar md:block md:w-60">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-sm font-semibold text-primary tracking-wide">
            <Monitor className="h-5 w-5" />
            ONEDESK
          </Link>
        </div>
        <nav className="flex-1 overflow-auto px-3 py-4 space-y-0.5">
          {routes.map((route) =>
            route.show ? (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all",
                  (pathname.startsWith(route.href) && route.href !== "/dashboard") || pathname === route.href
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <route.icon className="h-3.5 w-3.5" />
                {route.label}
              </Link>
            ) : null
          )}
        </nav>
        <div className="border-t border-border px-5 py-3 font-mono text-[10px] text-muted-foreground">
          <span className="text-primary">●</span> SYSTEM ONLINE
        </div>
      </div>
    </div>
  );
}
