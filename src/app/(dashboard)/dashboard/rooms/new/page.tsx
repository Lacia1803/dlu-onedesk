import { RoomForm } from "@/components/rooms/room-form";

export default function NewRoomPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Thêm Phòng máy</h1>
      <RoomForm />
    </div>
  );
}
