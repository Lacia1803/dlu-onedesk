import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            Đại học Đà Lạt · OneDesk
          </p>
          <h1 className="text-4xl font-bold tracking-tight">404 — Không tìm thấy trang</h1>
          <p className="text-muted-foreground">
            Trang bạn truy cập không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn
            hoặc quay về trang chủ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Bảng điều khiển
          </Link>
        </div>
      </div>
    </div>
  );
}
