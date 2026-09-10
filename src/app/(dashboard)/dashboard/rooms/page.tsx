import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "./delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RoomsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canEdit = role === "ADMIN" || role === "TECHNICIAN";
  const canDelete = role === "ADMIN";

  const rooms = await db.room.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phòng máy</h1>
        {canEdit && (
          <Link href="/dashboard/rooms/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng máy
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên phòng</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Sức chứa</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12">
                  <EmptyState
                    title="Không có dữ liệu phòng máy"
                    description="Hiện tại chưa có phòng máy nào trong hệ thống."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/rooms/${room.id}`} className="hover:underline text-primary">
                      {room.name}
                    </Link>
                  </TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell>{room.capacity} máy</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Link href={`/dashboard/rooms/${room.id}/edit`} aria-label="Chỉnh sửa phòng máy" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" title="Chỉnh sửa">
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete && <DeleteButton id={room.id} />}
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
