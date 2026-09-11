import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyAdminsAndTechs } from "@/lib/notifications";
import { rateLimit } from "@/lib/cache";

const TRANSFER_LIMIT = 10; // per minute per user

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return new Response(JSON.stringify({ success: false, error: "Không có quyền" }), {
      status: 403,
    });
  }

  // Rate limit check
  const rlKey = `${session.user.id}:transfer`;
  const { allowed } = rateLimit(rlKey, TRANSFER_LIMIT, 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ success: false, error: "Quá nhiều yêu cầu, vui lòng chờ" }),
      { status: 429 }
    );
  }

  const form = await req.formData();
  const deviceId = form.get("deviceId")?.toString();
  const roomId = form.get("roomId")?.toString();

  if (!deviceId || !roomId) {
    return new Response(JSON.stringify({ success: false, error: "Thiếu dữ liệu" }), {
      status: 400,
    });
  }

  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) {
    return new Response(JSON.stringify({ success: false, error: "Không tìm thấy thiết bị" }), {
      status: 404,
    });
  }

  await db.device.update({ where: { id: deviceId }, data: { roomId } });

  await db.deviceHistory.create({
    data: {
      deviceId,
      type: "RELOCATION",
      description: `Điều chuyển: ${device.roomId} → ${roomId}`,
      userId: session.user.id,
    },
  });

  await notifyAdminsAndTechs(
    "Điều chuyển thiết bị",
    `Thiết bị ${device.name} đã được chuyển phòng.`,
    `/dashboard/devices/${deviceId}`,
    "GENERAL"
  );

  revalidatePath(`/dashboard/devices/${deviceId}`);

  return new Response(JSON.stringify({ success: true }));
}
