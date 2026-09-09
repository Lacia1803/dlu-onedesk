"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Wrench, DollarSign, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface MaintenanceCalendarProps {
  initialLogs: LogItem[];
}

export function MaintenanceCalendar({ initialLogs }: MaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

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
          {days.map((day, idx) => {
            const dayLogs = getLogsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 transition-colors flex flex-col justify-between ${
                  !isCurrentMonth ? "bg-muted/20 text-muted-foreground" : "bg-card"
                } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                      isToday ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayLogs.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {dayLogs.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayLogs.slice(0, 3).map((log) => (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="w-full text-left truncate text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 text-foreground transition-colors flex items-center gap-1 border border-primary/20"
                    >
                      <Wrench className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{log.device.name}: {log.type}</span>
                    </button>
                  ))}
                  {dayLogs.length > 3 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{dayLogs.length - 3} khác
                    </p>
                  )}
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
