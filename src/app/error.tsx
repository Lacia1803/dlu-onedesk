"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertOctagon className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            Đại học Đà Lạt · OneDesk
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Đã xảy ra lỗi hệ thống</h1>
          <p className="text-muted-foreground">
            Hệ thống gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại. Nếu lỗi vẫn tiếp diễn,
            vui lòng liên hệ bộ phận IT Helpdesk.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/70">Mã lỗi: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="h-4 w-4" />
            Về bảng điều khiển
          </Link>
        </div>
      </div>
    </div>
  );
}
