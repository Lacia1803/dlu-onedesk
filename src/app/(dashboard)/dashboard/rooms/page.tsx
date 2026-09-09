import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
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
          <Button asChild>
            <Link href="/dashboard/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng máy
            </Link>
          </Button>
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
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Không có dữ liệu phòng máy
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
                      <Button variant="outline" size="icon" asChild title="Chỉnh sửa">
                        <Link href={`/dashboard/rooms/${room.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
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
