import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus, Edit } from "lucide-react";
import { DeleteButton } from "@/components/software/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SoftwarePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canEdit = role === "ADMIN" || role === "TECHNICIAN";
  const canDelete = role === "ADMIN";

  const softwareList = await db.software.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { devices: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phần mềm</h1>
        {canEdit && (
          <Link href="/dashboard/software/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Thêm phần mềm
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phần mềm</TableHead>
              <TableHead>Phiên bản</TableHead>
              <TableHead>Giấy phép</TableHead>
              <TableHead>Số thiết bị</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {softwareList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Chưa có phần mềm nào
                </TableCell>
              </TableRow>
            ) : (
              softwareList.map((sw) => (
                <TableRow key={sw.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/software/${sw.id}`} className="hover:underline text-primary">
                      {sw.name}
                    </Link>
                  </TableCell>
                  <TableCell>{sw.version || "-"}</TableCell>
                  <TableCell>{sw.license || "-"}</TableCell>
                  <TableCell>{sw._count.devices} máy</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Link href={`/dashboard/software/${sw.id}/edit`} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground" title="Chỉnh sửa">
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete && <DeleteButton id={sw.id} />}
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
