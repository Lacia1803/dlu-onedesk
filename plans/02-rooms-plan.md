# Quản lý Phòng máy (Rooms) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRUD phòng máy — tạo, xem, sửa, xóa (soft delete) phòng máy tại Trung tâm CNTT bằng Server Actions và UI Shadcn.

**Architecture:** Sử dụng Next.js Server Components cho fetch data (chức năng xem), Server Actions cho thao tác POST/PATCH/DELETE thay cho REST API độc lập để tối ưu Type Safety. React Hook Form + Zod dùng trên Client để validate và submit form.

**Tech Stack:** Next.js App Router, Prisma, Zod, React Hook Form, shadcn/ui, `lucide-react`.

**Spec:** `specs/02-rooms.md`

## Global Constraints
- Next.js App Router conventions (Server Components default).
- Validation mọi input bằng Zod.
- Kiểm tra quyền (Role check) trong Server Actions (`ADMIN`, `TECHNICIAN`, `USER`).
- Chỉ lưu Soft delete (cập nhật `deletedAt`).
- Tuân thủ `context/code-standards.md`.

---

### Task 1: Zod Schema & Server Actions

**Files:**
- Create: `src/lib/validations/room.ts`
- Create: `src/app/actions/room-actions.ts`

**Interfaces:**
- Produces: `roomSchema` (Zod object)
- Produces: `createRoom(data)`, `updateRoom(id, data)`, `deleteRoom(id)`

- [ ] **Step 1: Tạo Zod schema**
Tạo file `src/lib/validations/room.ts`.

```typescript
import * as z from "zod";

export const roomSchema = z.object({
  name: z.string().min(2, "Tên phòng phải có ít nhất 2 ký tự").max(100),
  location: z.string().min(2, "Vị trí phải có ít nhất 2 ký tự"),
  capacity: z.coerce.number().min(1, "Sức chứa tối thiểu là 1").max(500, "Sức chứa tối đa là 500"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
```

- [ ] **Step 2: Viết Server Actions**
Tạo file `src/app/actions/room-actions.ts`. Code thực hiện role check từ `getServerSession`, gọi Prisma thực hiện thao tác và dùng `revalidatePath`.

```typescript
"use server";

import { db } from "@/lib/db";
import { roomSchema, RoomFormValues } from "@/lib/validations/room";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRoom(data: RoomFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = roomSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.room.findFirst({ where: { name: parsed.data.name, deletedAt: null } });
  if (exists) return { success: false, error: "Tên phòng máy đã tồn tại." };

  await db.room.create({ data: parsed.data });
  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function updateRoom(id: string, data: RoomFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = roomSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.room.findFirst({
    where: { name: parsed.data.name, deletedAt: null, id: { not: id } }
  });
  if (exists) return { success: false, error: "Tên phòng máy đã tồn tại." };

  await db.room.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/rooms");
  revalidatePath(`/dashboard/rooms/${id}`);
  return { success: true };
}

export async function deleteRoom(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Chỉ Admin mới có quyền xóa phòng máy." };
  }

  const activeDevices = await db.device.count({
    where: { roomId: id, deletedAt: null, status: "ACTIVE" }
  });
  if (activeDevices > 0) {
    return { success: false, error: "Không thể xóa. Phòng này đang có thiết bị hoạt động." };
  }

  await db.room.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/dashboard/rooms");
  return { success: true };
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/validations/room.ts src/app/actions/room-actions.ts
git commit -m "feat(rooms): add schema validation and server actions for rooms"
```

---

### Task 2: Trang Danh sách Phòng máy

**Files:**
- Create: `src/app/(dashboard)/dashboard/rooms/page.tsx`
- Create: `src/app/(dashboard)/dashboard/rooms/delete-button.tsx` (Client component)

**Interfaces:**
- Consumes: Prisma `db.room.findMany`
- Consumes: Server Action `deleteRoom` từ Task 1.

- [ ] **Step 1: Tạo DeleteButton Component (Client)**
Tạo `src/app/(dashboard)/dashboard/rooms/delete-button.tsx`. Thành phần này sẽ hiển thị cảnh báo Alert Dialog trước khi gọi `deleteRoom`.

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoom } from "@/app/actions/room-actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteRoom(id);
    setLoading(false);
    if (res.success) {
      toast.success("Đã xóa phòng máy.");
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa phòng máy?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa phòng máy này? Hành động này sẽ ẩn phòng máy khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Viết Trang Danh sách Phòng máy (Server Component)**
Tạo `src/app/(dashboard)/dashboard/rooms/page.tsx`. Lấy danh sách từ Prisma. Thêm nút "Tạo phòng máy" trỏ đến `/dashboard/rooms/new`.

```tsx
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

      <div className="rounded-md border">
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
                <TableCell colSpan={4} className="text-center">Không có dữ liệu</TableCell>
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
                      <Button variant="outline" size="icon" asChild>
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
```

- [ ] **Step 3: Commit**
```bash
git add src/app/\(dashboard\)/dashboard/rooms/page.tsx src/app/\(dashboard\)/dashboard/rooms/delete-button.tsx
git commit -m "feat(rooms): create rooms list page with delete functionality"
```

---

### Task 3: Form tạo và sửa phòng máy (Client Component)

**Files:**
- Create: `src/components/rooms/room-form.tsx`

**Interfaces:**
- Consumes: `createRoom`, `updateRoom` từ `src/app/actions/room-actions.ts`.
- Có tham số `initialData?: Room` để tái sử dụng làm Form Sửa.

- [ ] **Step 1: Code RoomForm component**
Tạo file `src/components/rooms/room-form.tsx`.

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, RoomFormValues } from "@/lib/validations/room";
import { createRoom, updateRoom } from "@/app/actions/room-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Room } from "@prisma/client";

interface RoomFormProps {
  initialData?: Room | null;
}

export function RoomForm({ initialData }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData || {
      name: "",
      location: "",
      capacity: 30,
      description: "",
    },
  });

  async function onSubmit(data: RoomFormValues) {
    setLoading(true);
    const result = initialData 
      ? await updateRoom(initialData.id, data) 
      : await createRoom(data);
      
    setLoading(false);

    if (result.success) {
      toast.success(initialData ? "Đã cập nhật!" : "Đã tạo phòng máy!");
      router.push("/dashboard/rooms");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên phòng máy</FormLabel>
              <FormControl>
                <Input placeholder="Lab CNTT 1" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí</FormLabel>
                <FormControl>
                  <Input placeholder="Tầng 1, Nhà A" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sức chứa (Máy)</FormLabel>
                <FormControl>
                  <Input type="number" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả chi tiết</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm về phòng máy này..." disabled={loading} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo mới")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/rooms/room-form.tsx
git commit -m "feat(rooms): create reusable room form component"
```

---

### Task 4: Trang Thêm mới & Chỉnh sửa (Server Components)

**Files:**
- Create: `src/app/(dashboard)/dashboard/rooms/new/page.tsx`
- Create: `src/app/(dashboard)/dashboard/rooms/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `RoomForm` từ Task 3.
- Consumes: `db.room.findUnique` để nạp dữ liệu cho trang edit.

- [ ] **Step 1: Viết trang tạo mới**
Tạo file `src/app/(dashboard)/dashboard/rooms/new/page.tsx`.

```tsx
import { RoomForm } from "@/components/rooms/room-form";

export default function NewRoomPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Thêm Phòng máy</h1>
      <RoomForm />
    </div>
  );
}
```

- [ ] **Step 2: Viết trang chỉnh sửa**
Tạo file `src/app/(dashboard)/dashboard/rooms/[id]/edit/page.tsx`. Fetch db.room.findUnique dựa vào id, truyền vào `initialData`. Nếu không thấy trả về `notFound()`.

```tsx
import { db } from "@/lib/db";
import { RoomForm } from "@/components/rooms/room-form";
import { notFound } from "next/navigation";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const room = await db.room.findUnique({
    where: { id: resolvedParams.id, deletedAt: null },
  });

  if (!room) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Sửa Phòng máy: {room.name}</h1>
      <RoomForm initialData={room} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/\(dashboard\)/dashboard/rooms/new/page.tsx src/app/\(dashboard\)/dashboard/rooms/\[id\]/edit/page.tsx
git commit -m "feat(rooms): create pages for adding and editing rooms"
```

---

### Task 5: Trang Chi tiết Phòng máy (Server Component)

**Files:**
- Create: `src/app/(dashboard)/dashboard/rooms/[id]/page.tsx`

**Interfaces:**
- Consumes: `db.room.findUnique` kèm include `devices`.

- [ ] **Step 1: Code trang Chi tiết**
Tạo file `src/app/(dashboard)/dashboard/rooms/[id]/page.tsx`. Fetch chi tiết phòng và mảng các thiết bị (Devices) đang `ACTIVE` trong phòng đó. 

```tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const room = await db.room.findUnique({
    where: { id: resolvedParams.id, deletedAt: null },
    include: {
      devices: {
        where: { deletedAt: null },
        orderBy: { name: "asc" }
      }
    }
  });

  if (!room) notFound();

  const activeCount = room.devices.filter(d => d.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/rooms">Quay lại</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vị trí</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{room.location}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sức chứa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{room.capacity} máy</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeCount} / {room.devices.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          {room.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Phòng máy chưa có thiết bị nào.</p>
          ) : (
            <ul className="space-y-2">
              {room.devices.map(device => (
                <li key={device.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md border">
                  <div>
                    <Link href={`/dashboard/devices/${device.id}`} className="font-medium text-primary hover:underline">
                      {device.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">{device.type}</span>
                  </div>
                  <div className="text-sm">
                    {device.status === "ACTIVE" && <span className="text-green-600">Đang hoạt động</span>}
                    {device.status === "BROKEN" && <span className="text-red-600">Hỏng</span>}
                    {device.status === "MAINTENANCE" && <span className="text-yellow-600">Bảo trì</span>}
                    {device.status === "RETIRED" && <span className="text-gray-500">Thanh lý</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/\(dashboard\)/dashboard/rooms/\[id\]/page.tsx
git commit -m "feat(rooms): create room detail page showing devices"
```
