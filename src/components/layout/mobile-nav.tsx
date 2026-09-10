"use client";

import { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { getNavRoutes } from "@/lib/nav-items";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const role = session?.user?.role || "USER";
  const routes = getNavRoutes(role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Mở menu"
        className="md:hidden -ml-1 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[280px]">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border p-4">
          <SheetTitle>Menu</SheetTitle>
          <SheetClose
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>
        <nav className="flex flex-col gap-1 overflow-y-auto p-2">
          {routes
            .filter((route) => route.show)
            .map((route) => {
              const active =
                route.href === "/dashboard"
                  ? pathname === route.href
                  : pathname.startsWith(route.href);
              return (
                <SheetClose
                  key={route.href}
                  render={
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    />
                  }
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </SheetClose>
              );
            })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
