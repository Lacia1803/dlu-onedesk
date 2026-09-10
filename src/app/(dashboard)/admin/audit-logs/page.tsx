import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PaginationControls } from "@/components/ui/pagination-controls";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

const ACTION_LABELS: Record<string, string> = {
  USER_ROLE_UPDATE: "Đổi vai trò",
  USER_DEACTIVATE: "Vô hiệu hóa",
  USER_RESTORE: "Khôi phục",
  USER_2FA_ENABLE: "Bật 2FA",
  USER_2FA_DISABLE: "Tắt 2FA",
  TICKET_CREATE: "Tạo ticket",
  TICKET_UPDATE: "Cập nhật ticket",
};

const ACTION_STYLES: Record<string, string> = {
  USER_ROLE_UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  USER_DEACTIVATE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  USER_RESTORE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  USER_2FA_ENABLE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  USER_2FA_DISABLE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  TICKET_CREATE: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  TICKET_UPDATE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { q, page: pageParam } = await searchParams;
  const keyword = q?.trim();
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const where: any = keyword ? { // eslint-disable-line @typescript-eslint/no-explicit-any
    OR: [
      { action: { contains: keyword, mode: "insensitive" as const } },
      { entity: { contains: keyword, mode: "insensitive" as const } },
      { entityId: { contains: keyword, mode: "insensitive" as const } },
      { user: { name: { contains: keyword, mode: "insensitive" as const } } },
      { user: { email: { contains: keyword, mode: "insensitive" as const } } },
    ],
  } : undefined;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhật ký hệ thống</h1>
          <p className="text-muted-foreground">
            Ghi lại các hoạt động quan trọng (vai trò, xóa/khôi phục, 2FA, ticket).
          </p>
        </div>
      </div>

      <form className="relative max-w-sm" action="/admin/audit-logs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={keyword}
          placeholder="Tìm theo hành động, email, entityId..."
          className="pl-9"
        />
      </form>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <EmptyState title="Chưa có nhật ký hoạt động nào" description="Hệ thống chưa ghi nhận hoạt động nào trong khoảng thời gian này." />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{log.user?.name ?? "Hệ thống"}</div>
                    <div className="text-xs text-muted-foreground">{log.user?.email ?? "—"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ACTION_STYLES[log.action] ?? "bg-gray-100 text-gray-700"}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entity}
                    {log.entityId && (
                      <span className="text-muted-foreground"> #{log.entityId.slice(-6).toUpperCase()}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl="/admin/audit-logs"
        searchParams={{ q }}
      />
    </div>
  );
}
