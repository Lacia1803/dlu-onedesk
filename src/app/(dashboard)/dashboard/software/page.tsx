import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/software/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
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

export default async function SoftwarePage({
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

  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: "insensitive" as const } },
          { version: { contains: keyword, mode: "insensitive" as const } },
          { license: { contains: keyword, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [softwareList, total] = await Promise.all([
    db.software.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.software.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phần mềm</h1>
        {canEdit && (
          <Link
            href="/dashboard/software/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm phần mềm
          </Link>
        )}
      </div>

      <form className="relative max-w-sm" action="/dashboard/software">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={keyword}
          placeholder="Tìm theo tên, phiên bản, license..."
          className="pl-9"
        />
      </form>

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
                <TableCell colSpan={5} className="py-12">
                  <EmptyState
                    title="Chưa có phần mềm nào"
                    description="Hiện chưa có phần mềm nào được ghi nhận."
                  />
                </TableCell>
              </TableRow>
            ) : (
              softwareList.map((sw) => (
                <TableRow key={sw.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/software/${sw.id}`}
                      className="hover:underline text-primary"
                    >
                      {sw.name}
                    </Link>
                  </TableCell>
                  <TableCell>{sw.version || "-"}</TableCell>
                  <TableCell>{sw.license || "-"}</TableCell>
                  <TableCell>{sw._count.devices} máy</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Link
                        href={`/dashboard/software/${sw.id}/edit`}
                        aria-label="Chỉnh sửa phần mềm"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                        title="Chỉnh sửa"
                      >
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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl="/dashboard/software"
        searchParams={{ q }}
      />
    </div>
  );
}
