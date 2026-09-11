import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { explainQuery } from "@/lib/query-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Benchmark heavy aggregation queries
    const ticketExplain = await explainQuery(
      `SELECT status, priority, count(*) FROM "tickets" GROUP BY status, priority;`
    );

    const deviceExplain = await explainQuery(
      `SELECT status, count(*) FROM "devices" WHERE "deletedAt" IS NULL GROUP BY status;`
    );

    return NextResponse.json({
      success: true,
      data: {
        ticketQueryPlan: ticketExplain,
        deviceQueryPlan: deviceExplain,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error running EXPLAIN" },
      { status: 500 }
    );
  }
}
