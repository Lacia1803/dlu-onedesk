"use client";

import { getNavRoutes } from "@/lib/nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trees } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role || "USER";

  const routes = getNavRoutes(role);

  return (
    <div className="hidden border-r border-sidebar-border bg-sidebar md:block md:w-60">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-sidebar-foreground"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Trees className="h-4.5 w-4.5" />
            </span>
            DLU <span className="text-sidebar-primary">OneDesk</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto px-3 py-4 space-y-1">
          {routes.map((route) =>
            route.show ? (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  (pathname.startsWith(route.href) && route.href !== "/dashboard") ||
                    pathname === route.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ) : null
          )}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-3 text-[10.5px] font-semibold tracking-wide text-sidebar-foreground/60">
          <span className="text-sidebar-primary">●</span> SYSTEM ONLINE
        </div>
      </div>
    </div>
  );
}
