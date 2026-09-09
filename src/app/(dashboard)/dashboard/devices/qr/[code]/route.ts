import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const device = await db.device.findUnique({
    where: { qrCode: params.code },
    select: { id: true, deletedAt: true }
  });

  if (!device || device.deletedAt) {
    // Redirect to a not-found or devices list with error
    redirect("/dashboard/devices?error=qr_not_found");
  }

  redirect(`/dashboard/devices/${device.id}`);
}
