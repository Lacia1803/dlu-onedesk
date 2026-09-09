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
