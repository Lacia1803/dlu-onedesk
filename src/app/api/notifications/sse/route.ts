import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifBus } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: unknown) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      };

      notifBus.on(`notif:${userId}`, listener);
      if (isStaff) {
        notifBus.on("notif:staff", listener);
      }

      // Send initial keepalive ping
      controller.enqueue(new TextEncoder().encode(":ping\n\n"));

      const pingInterval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(":ping\n\n"));
      }, 20000);

      req.signal.addEventListener("abort", () => {
        notifBus.off(`notif:${userId}`, listener);
        if (isStaff) {
          notifBus.off("notif:staff", listener);
        }
        clearInterval(pingInterval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
