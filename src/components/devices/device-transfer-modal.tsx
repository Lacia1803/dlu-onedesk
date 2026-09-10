"use client";

import { useState } from "react";

export function DeviceTransferModal({ deviceId, currentRoomId }: { deviceId: string; currentRoomId: string }) {
  const [targetRoom, setTargetRoom] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTransfer() {
    if (!targetRoom) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("deviceId", deviceId);
    fd.append("roomId", targetRoom);

    const res = await fetch("/api/devices/transfer", { method: "POST", body: fd });
    if (res.ok) {
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <div className="border p-4 rounded bg-card space-y-2">
      <h3 className="font-bold">Điều chuyển thiết bị</h3>
      <input
        type="text"
        placeholder="Mã phòng mới (roomId)..."
        value={targetRoom}
        onChange={(e) => setTargetRoom(e.target.value)}
        className="border p-1 text-sm rounded w-full"
      />
      <button
        onClick={handleTransfer}
        disabled={loading}
        className="bg-primary text-primary-foreground px-3 py-1 text-xs rounded"
      >
        {loading ? "Đang chuyển..." : "Xác nhận bàn giao/điều chuyển"}
      </button>
    </div>
  );
}
