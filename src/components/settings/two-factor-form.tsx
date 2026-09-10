"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { enableTwoFactor, verifyTwoFactor, disableTwoFactor } from "@/app/actions/user-actions";
import { ShieldCheck, ShieldAlert, KeyRound, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export function TwoFactorForm({
  userId,
  twoFactorEnabled,
}: {
  userId: string;
  twoFactorEnabled: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(twoFactorEnabled);
  const [stage, setStage] = useState<"idle" | "verifying">(twoFactorEnabled ? "idle" : "idle");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStartEnable() {
    setLoading(true);
    const res = await enableTwoFactor(userId);
    setLoading(false);
    if (res.success && res.qrCodeUrl) {
      setQrCodeUrl(res.qrCodeUrl);
      setSecret(res.secret || "");
      setStage("verifying");
    } else {
      toast.error(res.error || "Không thể khởi tạo 2FA");
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    const res = await verifyTwoFactor(code.trim(), userId);
    setLoading(false);
    if (res.success) {
      toast.success("Bảo mật 2 lớp (2FA) đã được kích hoạt thành công!");
      setIsEnabled(true);
      setStage("idle");
      setCode("");
      setQrCodeUrl("");
    } else {
      toast.error(res.error || "Mã OTP không chính xác");
    }
  }

  async function handleDisable() {
    if (!confirm("Bạn có chắc chắn muốn tắt xác thực 2 lớp?")) return;

    setLoading(true);
    const res = await disableTwoFactor(userId);
    setLoading(false);
    if (res.success) {
      toast.success("Đã tắt xác thực 2 lớp.");
      setIsEnabled(false);
      setStage("idle");
    } else {
      toast.error(res.error || "Không thể tắt 2FA");
    }
  }

  return (
    <Card className="mt-6 border-zinc-800 bg-zinc-950/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          )}
          <CardTitle className="text-base font-mono uppercase tracking-wider">
            Bảo mật hai lớp (2-FA)
          </CardTitle>
          <Dialog>
            <DialogTrigger
              className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Hướng dẫn kích hoạt 2FA"
            >
              <HelpCircle className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Hướng dẫn kích hoạt Bảo mật 2 lớp</DialogTitle>
                <DialogDescription>
                  Bảo mật 2 lớp yêu cầu mã OTP từ ứng dụng authenticator ngoài mật khẩu, giúp tài khoản an toàn hơn.
                </DialogDescription>
              </DialogHeader>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
                <li>
                  <strong className="text-foreground">Cài đặt ứng dụng authenticator</strong> — Tải Google Authenticator hoặc Authy trên điện thoại (iOS / Android).
                </li>
                <li>
                  <strong className="text-foreground">Nhấn &ldquo;Kích hoạt 2-FA&rdquo;</strong> — Hệ thống sẽ hiển thị mã QR.
                </li>
                <li>
                  <strong className="text-foreground">Quét mã QR</strong> — Mở ứng dụng → nhấn <span className="font-mono text-xs bg-muted px-1 rounded">+</span> → chọn <em>Quét mã QR</em> → quét mã trên màn hình. Nếu không quét được, nhập thủ công mã bí mật (secret key) hiển thị dưới QR.
                </li>
                <li>
                  <strong className="text-foreground">Xác nhận</strong> — Nhập mã OTP 6 chữ số hiện trên ứng dụng → nhấn <em>Xác nhận &amp; Kích hoạt</em>.
                </li>
                <li>
                  <strong className="text-foreground">Đăng nhập lần sau</strong> — Sau khi nhập email + mật khẩu, hệ thống sẽ yêu cầu mã OTP → mở ứng dụng → nhập mã 6 chữ số.
                </li>
              </ol>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ Nếu mất điện thoại, liên hệ Admin để tắt 2-FA.
              </p>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          {isEnabled
            ? "Tài khoản của bạn đang được bảo vệ bởi xác thực OTP ứng dụng."
            : "Tăng cường an toàn khi đăng nhập bằng mã OTP từ Google Authenticator hoặc Authy."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded">
              ● ĐANG HOẠT ĐỘNG
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisable}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tắt xác thực 2FA"}
            </Button>
          </div>
        ) : stage === "verifying" ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-xs text-muted-foreground">
              1. Quét mã QR này bằng ứng dụng Authenticator (Google Authenticator, Authy, etc.):
            </div>
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-md w-fit mx-auto">
                <Image
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
            )}
            {secret && (
              <div className="text-center">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Mã thiết lập thủ công: <code className="text-primary font-bold">{secret}</code>
                </span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                2. Nhập mã OTP 6 chữ số:
              </label>
              <Input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="font-mono text-center tracking-[0.3em] text-lg max-w-[200px] mx-auto"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStage("idle")}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={loading || code.length < 6}>
                {loading ? "Đang xác nhận..." : "Xác nhận & Kích hoạt"}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEnable}
            disabled={loading}
          >
            {loading ? "Đang tạo mã..." : "Kích hoạt 2-FA"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
