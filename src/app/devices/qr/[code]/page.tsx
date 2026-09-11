import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { GuestReportForm } from "@/components/devices/guest-report-form";

export default async function QrLookupPage({ params }: { params: { code: string } }) {
  const { code } = await params;

  const device = await db.device.findUnique({
    where: { qrCode: code },
    select: { id: true, name: true, room: { select: { name: true } }, deletedAt: true },
  });

  if (!device || device.deletedAt) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo sự cố nhanh</h1>
          <p className="text-muted-foreground">
            Thiết bị: <span className="font-semibold text-foreground">{device.name}</span>
            {device.room && ` — Phòng ${device.room.name}`}
          </p>
        </div>

        <GuestReportForm deviceId={device.id} deviceName={device.name} />
      </div>
    </div>
  );
}
