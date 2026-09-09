import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface LogAuditParams {
  action: string;
  entity: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  userId?: string;
}

export async function logAudit({
  action,
  entity,
  entityId,
  details,
  userId,
}: LogAuditParams) {
  try {
    return await db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details,
        userId,
      },
    });
  } catch (error) {
    console.error("Lỗi khi ghi AuditLog:", error);
    return null;
  }
}
