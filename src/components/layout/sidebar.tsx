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
  Disc
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role || "USER";

  const routes = [
    {
      label: "Tổng quan",
      icon: LayoutDashboard,
      href: "/dashboard",
      show: true,
    },
    {
      label: "Hỗ trợ (Tickets)",
      icon: Ticket,
      href: "/dashboard/tickets",
      show: true,
    },
    {
      label: "Cẩm nang (FAQ)",
      icon: BookOpen,
      href: "/dashboard/faq",
      show: true,
    },
    {
      label: "Phòng máy",
      icon: Server,
      href: "/dashboard/rooms",
      show: role === "ADMIN" || role === "TECHNICIAN",
    },
    {
      label: "Thiết bị",
      icon: Monitor,
      href: "/dashboard/devices",
      show: true,
    },
    {
      label: "Phần mềm",
      icon: Disc,
      href: "/dashboard/software",
      show: true,
    },
    {
      label: "Người dùng",
      icon: Users,
      href: "/admin/users",
      show: role === "ADMIN",
    },
    {
      label: "Cài đặt",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ];

  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="">DLU OneDesk</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4 space-y-1">
            {routes.map((route) =>
              route.show ? (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    pathname.startsWith(route.href) && route.href !== "/dashboard" || pathname === route.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ) : null
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
