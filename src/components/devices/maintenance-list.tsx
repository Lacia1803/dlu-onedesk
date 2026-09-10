"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MaintenanceLogWithDetails } from "@/app/actions/device-actions";

interface Props {
  deviceId: string;
  logs: MaintenanceLogWithDetails[];
  canEdit: boolean;
}

export function MaintenanceList({ deviceId, logs, canEdit }: Props) {
  const router = useRouter();
  const [, setIsEditing] = useState<string | null>(null);

  // Sort newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg border-b pb-2">Lịch sử bảo trì</h3>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/maintenance/new?deviceId=${deviceId}`)}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm mới
          </Button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày thực hiện</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Chi phí</TableHead>
              <TableHead>Kỹ thuật viên</TableHead>
              <TableHead>Phụ tùng thay thế</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Chưa có lịch sử bảo trì nào.
                </TableCell>
              </TableRow>
            ) : (
              sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.performedAt), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                  <TableCell>{log.cost?.toLocaleString("vi-VN") || "-"}</TableCell>
                  <TableCell>{log.technician.name}</TableCell>
                  <TableCell>{log.parts || "-"}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(log.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm("Xác nhận xóa lịch sử bảo trì này?")) {
                            toast.error("Tính năng xóa đang phát triển");
                          }
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ponytail: Basic read-only list with edit/delete placeholder. Upgrade path: add modal for inline edit when backend supports it.
