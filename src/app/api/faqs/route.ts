import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active") === "true";

  const faqs = await db.faq.findMany({
    where: active ? { isActive: true } : {},
    select: { id: true, question: true, answer: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(faqs);
}
