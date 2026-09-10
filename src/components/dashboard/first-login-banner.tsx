"use client";

import { AlertTriangle, KeyRound, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FirstLoginBanner({ mustChange }: { mustChange: boolean }) {
  if (!mustChange) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Cảnh báo bảo mật tài khoản</h4>
          <p className="text-xs opacity-90">
            Tài khoản của bạn đang sử dụng mật khẩu mặc định (được import hoặc do Admin cấp lại). Vui lòng đổi mật khẩu ngay tại trang Cài đặt để đảm bảo an toàn.
          </p>
        </div>
      </div>
      <Link
        href="/settings"
        className="inline-flex shrink-0 items-center gap-0 rounded-md border border-amber-500/50 bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-amber-500/20"
      >
        <KeyRound className="mr-1.5 h-4 w-4" />
        Đổi mật khẩu ngay
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
