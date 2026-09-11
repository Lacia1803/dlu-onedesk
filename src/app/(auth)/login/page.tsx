"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [needOtp, setNeedOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Bước 1: kiểm tra xem tài khoản có bật 2FA không
      if (!needOtp) {
        const check = await fetch("/api/auth/check-2fa", {
          method: "POST",
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        const { twoFactorEnabled } = await check.json();

        if (twoFactorEnabled) {
          setNeedOtp(true);
          setIsLoading(false);
          return;
        }
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        token: needOtp ? otp : undefined,
        redirect: false,
      });

      if (signInResult?.error) {
        const msg = needOtp ? "Mã xác thực OTP không chính xác" : "Email hoặc mật khẩu không chính xác";
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      const msg = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập vào hệ thống DLU OneDesk</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {needOtp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã xác thực OTP</label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="font-mono text-center tracking-[0.3em] text-lg"
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Tài khoản này yêu cầu mã OTP từ ứng dụng Authenticator.
                  </p>
                </div>
              )}
              {errorMessage && (
                <p className="text-sm font-medium text-destructive text-center">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : needOtp ? "Xác thực & Đăng nhập" : "Đăng nhập"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground text-center">
            Tài khoản hệ thống do Trung tâm CNTT cấp.
            <br />
            Vui lòng liên hệ Quản trị viên để được cấp tài khoản.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
