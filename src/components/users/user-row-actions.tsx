"use client";

import { useState } from "react";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { RotateCcw, Trash2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateUserRole, deleteUser, restoreUser } from "@/app/actions/user-actions";
import { adminResetPassword } from "@/app/actions/user-settings";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị",
  TECHNICIAN: "Kỹ thuật viên",
  USER: "Người dùng",
};

export function UserRowActions({
  userId,
  currentRole,
  isSelf,
  isDeleted = false,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
  isDeleted?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  async function handleAdminReset() {
    setResetDialogOpen(false);
    setResetting(true);
    const res = await adminResetPassword(userId);
    setResetting(false);
    if (res.success) {
      toast.success(`Đã đặt lại mật khẩu tạm: ${res.tempPassword}`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function handleRoleChange(newRole: Role) {
    if (newRole === currentRole) return;
    setSaving(true);
    const res = await updateUserRole({ id: userId, role: newRole });
    setSaving(false);
    if (res.success) {
      toast.success("Đã cập nhật vai trò.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteUser(userId);
    setDeleting(false);
    if (res.success) {
      toast.success("Đã vô hiệu hóa người dùng.");
      setConfirmOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    const res = await restoreUser(userId);
    setRestoring(false);
    if (res.success) {
      toast.success("Đã khôi phục người dùng.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  if (isDeleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleRestore}
        disabled={restoring}
      >
        <RotateCcw className="h-4 w-4 mr-1.5" />
        {restoring ? "Đang khôi phục..." : "Khôi phục"}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        defaultValue={currentRole}
        onValueChange={(v) => handleRoleChange(v as Role)}
        disabled={saving || isSelf}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => setResetDialogOpen(true)}
        disabled={resetting || isSelf}
        title="Đặt lại mật khẩu mặc định"
      >
        <KeyRound className="h-4 w-4" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50" title="Vô hiệu hóa" disabled={isSelf}>
          <Trash2 className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vô hiệu hóa người dùng?</DialogTitle>
            <DialogDescription>
              Người dùng sẽ không thể đăng nhập. Dữ liệu ticket và lịch sử vẫn được giữ lại.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang xử lý..." : "Vô hiệu hóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt lại mật khẩu</AlertDialogTitle>
            <AlertDialogDescription>
              Đặt lại mật khẩu người dùng này về mặc định (chính là email của họ)? Họ sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdminReset}>
              Đặt lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
