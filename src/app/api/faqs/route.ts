import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get("active") === "true";

  const faqs = await db.faq.findMany({
    where: active ? { isActive: true } : {},
    select: { id: true, question: true, answer: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(faqs);
}
