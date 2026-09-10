"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeviceTransferModal({ deviceId, currentRoomId }: { deviceId: string; currentRoomId: string }) {
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [targetRoom, setTargetRoom] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch rooms list via cache-enabled endpoint
    fetch("/api/rooms")
      .then((res) => res.json())
      .then(setRooms)
      .catch(() => toast.error("Không tải danh sách phòng"));
  }, []);

  async function handleTransfer() {
    if (!targetRoom) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("deviceId", deviceId);
    fd.append("roomId", targetRoom);
    const res = await fetch("/api/devices/transfer", { method: "POST", body: fd });
    if (res.ok) {
      toast.success("Đã chuyển thiết bị");
      window.location.reload();
    } else {
      toast.error("Chuyển thất bại");
    }
    setLoading(false);
  }

  return (
    <div className="border p-4 rounded bg-card space-y-2">
      <h3 className="font-bold">Điều chuyển thiết bị</h3>
      <select
        value={targetRoom}
        onChange={(e) => setTargetRoom(e.target.value)}
        className="border p-1 text-sm rounded w-full mb-2"
      >
        <option value="" disabled>
          -- Chọn phòng mới --
        </option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id} disabled={r.id === currentRoomId}>
            {r.name} {r.id === currentRoomId ? "(hiện tại)" : ""}
          </option>
        ))}
      </select>
      <Button onClick={handleTransfer} disabled={loading || !targetRoom} className="w-full">
        {loading ? "Đang chuyển..." : "Xác nhận bàn giao/điều chuyển"}
      </Button>
    </div>
  );
}
