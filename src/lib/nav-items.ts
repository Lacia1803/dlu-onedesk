import {
  LayoutDashboard,
  Ticket,
  Monitor,
  Server,
  BookOpen,
  Users,
  Disc,
  CalendarDays,
  ScrollText,
  MessagesSquare,
  Gauge,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  show: boolean;
}

/**
 * Danh sách route điều hướng dùng chung cho Sidebar (desktop) và MobileNav (drawer).
 * show = theo vai trò người dùng hiện tại.
 */
export function getNavRoutes(role: string | undefined): NavItem[] {
  const isStaff = role === "ADMIN" || role === "TECHNICIAN";
  return [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", show: true },
    { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", show: true },
    { label: "FAQ", icon: BookOpen, href: "/dashboard/faq", show: true },
    { label: "Lịch sử chat AI", icon: MessagesSquare, href: "/dashboard/chat-history", show: true },
    { label: "Phòng máy", icon: Server, href: "/dashboard/rooms", show: isStaff },
    { label: "Thiết bị", icon: Monitor, href: "/dashboard/devices", show: true },
    { label: "Phần mềm", icon: Disc, href: "/dashboard/software", show: true },
    { label: "KPI của tôi", icon: Gauge, href: "/dashboard/my-kpi", show: isStaff },
    { label: "Bảo trì", icon: CalendarDays, href: "/dashboard/maintenance", show: isStaff },
    { label: "Người dùng", icon: Users, href: "/admin/users", show: role === "ADMIN" },
    {
      label: "Nhật ký hệ thống",
      icon: ScrollText,
      href: "/admin/audit-logs",
      show: role === "ADMIN",
    },
    { label: "Thông báo", icon: Bell, href: "/dashboard/notifications", show: true },
  ];
}
