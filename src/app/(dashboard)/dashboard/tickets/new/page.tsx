import { db } from "@/lib/db";
import { TicketForm } from "@/components/tickets/ticket-form";

export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ deviceId?: string }> }) {
  const devices = await db.device.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, qrCode: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tạo Ticket (Báo cáo sự cố)</h1>
      <TicketForm devices={devices} initialDeviceId={(await searchParams).deviceId} />
    </div>
  );
}
