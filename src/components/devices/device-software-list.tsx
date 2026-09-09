"use client";

import { useState } from "react";
import { addSoftwareToDevice, removeSoftwareFromDevice } from "@/app/actions/device-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceSoftwareListProps {
  deviceId: string;
  installedSoftware: any[];
  allSoftware: any[];
  canEdit: boolean;
}

export function DeviceSoftwareList({
  deviceId,
  installedSoftware,
  allSoftware,
  canEdit,
}: DeviceSoftwareListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState("");

  // Filter out software that is already installed
  const installedSoftwareIds = new Set(installedSoftware.map((ds) => ds.softwareId));
  const availableSoftware = allSoftware.filter((sw) => !installedSoftwareIds.has(sw.id));

  async function handleAdd() {
    if (!selectedSoftwareId) {
      toast.error("Vui lòng chọn phần mềm");
      return;
    }

    setLoading(true);
    const res = await addSoftwareToDevice(deviceId, { softwareId: selectedSoftwareId });
    setLoading(false);

    if (res.success) {
      toast.success("Đã thêm phần mềm vào thiết bị");
      setOpen(false);
      setSelectedSoftwareId("");
    } else {
      toast.error(res.error);
    }
  }

  async function handleRemove(id: string) {
    setLoading(true);
    const res = await removeSoftwareFromDevice(id, deviceId);
    setLoading(false);

    if (res.success) {
      toast.success("Đã gỡ phần mềm khỏi thiết bị");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Danh sách phần mềm đã cài đặt</h3>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Thêm phần mềm
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm phần mềm vào thiết bị</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Chọn phần mềm</Label>
                  {availableSoftware.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Tất cả phần mềm có sẵn đã được gán cho thiết bị này hoặc chưa có phần mềm trong hệ thống.
                    </p>
                  ) : (
                    <Select value={selectedSoftwareId} onValueChange={(val: any) => setSelectedSoftwareId(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phần mềm..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSoftware.map((sw) => (
                          <SelectItem key={sw.id} value={sw.id}>
                            {sw.name} {sw.version ? `(${sw.version})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={loading || availableSoftware.length === 0}
                  >
                    {loading ? "Đang thêm..." : "Thêm"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-md divide-y">
        {installedSoftware.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Chưa có phần mềm nào được cài đặt.
          </div>
        ) : (
          installedSoftware.map((ds) => (
            <div key={ds.id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{ds.software.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Phiên bản: {ds.software.version || "-"}
                </p>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemove(ds.id)}
                  disabled={loading}
                  title="Gỡ phần mềm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
