"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Wrench, DollarSign, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LogItem {
  id: string;
  type: string;
  description: string;
  cost: number | null;
  performedAt: Date | string;
  deviceId: string;
  device: { name: string; room: { name: string } };
  technician: { name: string | null };
}

interface TicketItem {
  id: string;
  title: string;
  scheduledAt: Date | string | null;
  device?: { name: string } | null;
  status: string;
}

interface MaintenanceCalendarProps {
  initialLogs: LogItem[];
  scheduledTickets?: TicketItem[];
}

export function MaintenanceCalendar({ initialLogs, scheduledTickets = [] }: MaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const router = useRouter();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const getLogsForDay = (day: Date) => {
    return initialLogs.filter((log) =>
      isSameDay(new Date(log.performedAt), day)
    );
  };

  const getTicketsForDay = (day: Date) => {
    return scheduledTickets.filter((t) =>
      t.scheduledAt && isSameDay(new Date(t.scheduledAt), day)
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const { id } = JSON.parse(data);
      const res = await fetch("/api/tickets/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scheduledAt: day.toISOString() })
      });

      if (!res.ok) throw new Error("API failed");
      toast.success("Đã lên lịch ticket thành công");
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi lên lịch ticket");
      console.error(error);
    }
  };

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[200px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: vi })}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={today}>
          Hôm nay
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-sm font-medium py-2">
          {weekDays.map((day) => (
            <div key={day} className="text-muted-foreground">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b">
          {days.map((day) => {
            const dayLogs = getLogsForDay(day);
            const dayTickets = getTicketsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const totalItems = dayLogs.length + dayTickets.length;

            return (
              <div
                key={day.toISOString()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`min-h-[100px] p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "bg-card"
                } ${isToday ? "ring-2 ring-primary ring-inset" : ""} hover:bg-accent/50`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {totalItems > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {totalItems}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayTickets.map((t) => (
                    <div
                      key={`ticket-${t.id}`}
                      className="w-full text-left truncate text-xs p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 transition-colors border border-amber-500/20 cursor-pointer"
                      onClick={() => router.push(`/dashboard/tickets/${t.id}`)}
                    >
                      <span className="font-semibold">#{t.id.slice(-4).toUpperCase()}</span> {t.title}
                    </div>
                  ))}
                  {dayLogs.map((log) => (
                    <button
                      key={`log-${log.id}`}
                      onClick={() => setSelectedLog(log)}
                      className="w-full text-left truncate text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 text-foreground transition-colors flex items-center gap-1 border border-primary/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Wrench className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{log.device.name}: {log.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Chi tiết bảo trì
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Thiết bị</span>
                  <p className="font-semibold text-sm">{selectedLog.device.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Phòng</span>
                  <p className="font-semibold text-sm flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedLog.device.room.name}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Loại bảo trì</span>
                <p className="font-medium text-sm">{selectedLog.type}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Mô tả chi tiết</span>
                <p className="text-sm bg-muted/40 p-3 rounded-md mt-1">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Chi phí
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedLog.cost ? `${selectedLog.cost.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Kỹ thuật viên
                  </span>
                  <p className="font-medium text-sm">{selectedLog.technician.name || "N/A"}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-right pt-2">
                Ngày thực hiện: {format(new Date(selectedLog.performedAt), "dd/MM/yyyy")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
