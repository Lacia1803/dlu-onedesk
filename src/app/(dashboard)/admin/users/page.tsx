import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Search, Mail } from "lucide-react";
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
import { UserRowActions } from "@/components/users/user-row-actions";
import { ExportUsersButton } from "@/components/users/export-users-button";
import { ImportButton } from "@/components/import-button";

const ROLE_BADGE_STYLES: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  TECHNICIAN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  USER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị",
  TECHNICIAN: "Kỹ thuật viên",
  USER: "Người dùng",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { q } = await searchParams;
  const keyword = q?.trim();

  const users = await db.user.findMany({
    where: {
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { email: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <p className="text-muted-foreground">Xem và phân quyền tài khoản trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportButton label="Nhập người dùng" subdir="users" />
          <ExportUsersButton />
        </div>
      </div>

      <form className="relative max-w-sm" action="/admin/users">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={keyword}
          placeholder="Tìm theo tên hoặc email..."
          className="pl-9"
        />
      </form>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <EmptyState title="Không có người dùng nào" description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc." />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user.id === session.user.id;
                return (
                  <TableRow key={user.id} className={user.deletedAt ? "opacity-60" : undefined}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.name}
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px] px-1.5">Bạn</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={ROLE_BADGE_STYLES[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      {user.deletedAt && (
                        <Badge variant="secondary" className="ml-2">Đã vô hiệu hóa</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserRowActions
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={isSelf}
                        isDeleted={!!user.deletedAt}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
