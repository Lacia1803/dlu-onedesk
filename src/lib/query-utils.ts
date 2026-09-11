import { db } from "@/lib/db";

/**
 * Utility to run EXPLAIN ANALYZE on raw SQL queries for performance profiling and index verification.
 */
export async function explainQuery(rawSql: string): Promise<unknown> {
  return await db.$queryRawUnsafe(`EXPLAIN ANALYZE ${rawSql}`);
}
