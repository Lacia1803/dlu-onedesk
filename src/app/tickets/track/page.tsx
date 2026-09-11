"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trackTicket, type PublicTrackResult } from "@/app/actions/track-ticket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketStatusBadge } from "@/components/tickets/status-badge";
import { Search, CheckCircle2, Clock, Wrench, AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

function TrackTicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [ticket, setTicket] = useState<PublicTrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (searchCode: string) => {
    if (!searchCode.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await trackTicket(searchCode);
      if (res.success && res.data) {
        setTicket(res.data);
        setError(null);
      } else {
        setTicket(null);
        setError(res.error || "Không tìm thấy thông tin sự cố.");
      }
    });
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tickets/track?q=${encodeURIComponent(query.trim())}`);
    handleSearch(query);
  };

  // Determine step (1: Tiếp nhận, 2: Đang xử lý, 3: Hoàn thành)
  const getStep = (status: string) => {
    if (status === "OPEN") return 1;
    if (status === "IN_PROGRESS" || status === "WAITING_PARTS") return 2;
    if (status === "RESOLVED" || status === "CLOSED") return 3;
    return 0; // CANCELLED
  };

  const currentStep = ticket ? getStep(ticket.status) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
          <span className="text-xs font-mono text-muted-foreground">DLU ONEDESK · PUBLIC TRACKING</span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tra cứu tiến độ xử lý sự cố</h1>
          <p className="text-muted-foreground text-sm">
            Nhập mã ticket (VD: 6 ký tự cuối) hoặc mã sinh viên để theo dõi tình trạng sửa chữa.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập mã ticket (vd: A1B2C3) hoặc Mã sinh viên..."
                  className="pl-9"
                  disabled={isPending}
                />
              </div>
              <Button type="submit" disabled={isPending || !query.trim()}>
                {isPending ? "Đang tìm..." : "Tra cứu"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Ticket Details View */}
        {ticket && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Status Stepper */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">MÃ SỰ CỐ</span>
                    <h2 className="text-xl font-bold font-mono">#{ticket.code}</h2>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar / Steps */}
                {ticket.status !== "CANCELLED" ? (
                  <div className="relative flex items-center justify-between w-full px-2">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-muted w-full -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-0"
                      style={{
                        width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                      }}
                    />

                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                          currentStep >= 1
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Tiếp nhận</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                          currentStep >= 2
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Đang xử lý</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-2 bg-background px-2 z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                          currentStep >= 3
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Hoàn thành</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium">
                    Sự cố này đã được hủy bỏ hoặc đóng mà không xử lý.
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block">Tiêu đề</span>
                    <span className="font-semibold text-foreground">{ticket.title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Thiết bị / Vị trí</span>
                    <span className="font-medium text-foreground">
                      {ticket.deviceName || "Thiết bị chung"}
                      {ticket.roomName ? ` — Phòng ${ticket.roomName}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Thời gian gửi</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Cập nhật lần cuối</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(ticket.updatedAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Public Comments / Communication from Technicians */}
            {ticket.comments.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Phản hồi & Cập nhật từ Kỹ thuật viên
                  </CardTitle>
                  <CardDescription>Ghi chú công khai gửi đến người báo sự cố</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticket.comments.map((comment, idx) => (
                    <div key={idx} className="bg-muted/50 p-3.5 rounded-lg space-y-1.5 text-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{comment.authorName}</span>
                        <span>{format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicTicketTrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-muted-foreground">Đang tải...</div>}>
      <TrackTicketContent />
    </Suspense>
  );
}
