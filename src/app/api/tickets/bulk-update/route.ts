import { NextResponse } from "next/server";
import { bulkUpdateTickets } from "@/app/actions/ticket-actions";

export async function POST(req: Request) {
  try {
    const { ids, data } = await req.json();
    const res = await bulkUpdateTickets(ids, data);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ success: false, error: "Lỗi server" });
  }
}
