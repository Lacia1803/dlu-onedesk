import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus, Edit, QrCode } from "lucide-react";
import { DeleteDeviceButton } from "@/components/devices/delete-device-button";
import { ImportButton } from "@/components/import-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PaginationControls } from "@/components/ui/pagination-controls";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function DevicesPage({
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

  const where: any = { deletedAt: null }; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { serialNumber: { contains: keyword, mode: "insensitive" } },
      { qrCode: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const [devices, total] = await Promise.all([
    db.device.findMany({
      where,
      include: { room: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.device.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-green-500">Hoạt động</Badge>;
      case "BROKEN": return <Badge variant="destructive">Hỏng</Badge>;
      case "MAINTENANCE": return <Badge className="bg-yellow-500">Bảo trì</Badge>;
      case "RETIRED": return <Badge variant="secondary">Thanh lý</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "COMPUTER": return "Máy tính";
      case "NETWORK": return "Mạng";
      case "PERIPHERAL": return "Ngoại vi";
      default: return "Khác";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Thiết bị</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/devices/scan" className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
            <QrCode className="mr-2 h-4 w-4" />
            Quét QR
          </Link>
          {canEdit && (
            <Link href="/dashboard/devices/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Thêm thiết bị
            </Link>
          )}
          {canEdit && <ImportButton label="Nhập dữ liệu thiết bị" subdir="devices" />}
        </div>
      </div>

      <form className="relative max-w-sm" action="/dashboard/devices">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={keyword}
          placeholder="Tìm theo tên, serial, mã QR..."
          className="pl-9"
        />
      </form>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Phòng máy</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <EmptyState
                    title="Không có dữ liệu thiết bị"
                    description="Hiện chưa có thiết bị nào được ghi nhận."
                  />
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/devices/${device.id}`} className="hover:underline text-primary">
                      {device.name}
                    </Link>
                    {device.serialNumber && <div className="text-xs text-muted-foreground">SN: {device.serialNumber}</div>}
                  </TableCell>
                  <TableCell>{getTypeLabel(device.type)}</TableCell>
                  <TableCell>{device.room.name}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Link href={`/dashboard/devices/${device.id}/edit`} aria-label="Chỉnh sửa thiết bị" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" title="Chỉnh sửa">
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete && <DeleteDeviceButton id={device.id} />}
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
        baseUrl="/dashboard/devices"
        searchParams={{ q }}
      />
    </div>
  );
}
