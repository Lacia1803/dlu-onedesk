import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "./delete-button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canEdit = role === "ADMIN" || role === "TECHNICIAN";
  const canDelete = role === "ADMIN";

  const { q, page: pageParam } = await searchParams;
  const keyword = q?.trim();
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const where = {
    deletedAt: null,
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" as const } },
            { location: { contains: keyword, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rooms, total] = await Promise.all([
    db.room.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.room.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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

      <form className="relative max-w-sm" action="/dashboard/rooms">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={keyword}
          placeholder="Tìm theo tên phòng, vị trí..."
          className="pl-9"
        />
      </form>

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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl="/dashboard/rooms"
        searchParams={{ q }}
      />
    </div>
  );
}
