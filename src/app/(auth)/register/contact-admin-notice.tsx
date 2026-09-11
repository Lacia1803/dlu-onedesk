import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ContactAdminNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Đăng ký tài khoản đã tạm khóa</CardTitle>
          <CardDescription>
            Hệ thống DLU OneDesk là nền tảng nội bộ của Trường Đại học Đà Lạt. Tài khoản được
            Trung tâm CNTT tạo và quản lý tập trung, không mở đăng ký công khai.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold text-foreground">Để được cấp tài khoản, vui lòng:</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              Gửi yêu cầu kèm họ tên, MSSV/mã cán bộ đến email Trung tâm CNTT
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              Hoặc liên hệ trực tiếp quầy hỗ trợ phòng machine A1.1 (giờ hành chính T2–T6)
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Bạn đã có tài khoản? Đăng nhập ngay để gửi báo cáo sự cố hoặc quét QR trên thiết bị.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
            ← Về trang đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
