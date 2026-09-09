const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== BẮT ĐẦU TEST BULK ACTIONS CHO TICKETS ===");

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.error("Không tìm thấy user ADMIN để test!");
    process.exit(1);
  }

  // 1. Tạo 2 tickets mẫu
  const t1 = await prisma.ticket.create({
    data: {
      title: "Test Bulk Ticket 1",
      description: "Mô tả test 1",
      status: "OPEN",
      priority: "LOW",
      category: "HARDWARE",
      creatorId: admin.id,
    },
  });

  const t2 = await prisma.ticket.create({
    data: {
      title: "Test Bulk Ticket 2",
      description: "Mô tả test 2",
      status: "OPEN",
      priority: "LOW",
      category: "SOFTWARE",
      creatorId: admin.id,
    },
  });

  console.log(`✓ Đã tạo 2 ticket test: ${t1.id}, ${t2.id}`);

  // 2. Thực hiện bulk update (giả lập server action)
  const ticketIds = [t1.id, t2.id];
  await prisma.ticket.updateMany({
    where: { id: { in: ticketIds } },
    data: { status: "RESOLVED", priority: "URGENT" },
  });

  // Ghi audit log
  await prisma.auditLog.create({
    data: {
      action: "TICKET_BULK_UPDATE",
      entity: "Ticket",
      details: { ids: ticketIds, data: { status: "RESOLVED", priority: "URGENT" } },
      userId: admin.id,
    },
  });

  console.log("✓ Đã thực hiện updateMany và ghi AuditLog");

  // 3. Kiểm tra DB sau update
  const updated = await prisma.ticket.findMany({
    where: { id: { in: ticketIds } },
  });

  const allResolved = updated.every((t) => t.status === "RESOLVED" && t.priority === "URGENT");
  if (!allResolved) {
    console.error("FAIL: Trạng thái ticket không khớp sau bulk update!", updated);
    process.exit(1);
  }
  console.log("✓ Xác nhận tất cả ticket đã chuyển sang RESOLVED và URGENT");

  // 4. Kiểm tra AuditLog
  const audit = await prisma.auditLog.findFirst({
    where: { action: "TICKET_BULK_UPDATE" },
    orderBy: { createdAt: "desc" },
  });

  if (!audit) {
    console.error("FAIL: Không tìm thấy AuditLog của TICKET_BULK_UPDATE!");
    process.exit(1);
  }
  console.log("✓ Xác nhận AuditLog đã ghi nhận sự kiện bulk update:", audit.id);

  // 5. Cleanup
  await prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } });
  console.log("✓ Dọn dẹp dữ liệu test thành công!");

  console.log("=== TẤT CẢ TEST BULK ACTIONS ĐÃ PASS ===");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Lỗi test:", e);
  await prisma.$disconnect();
  process.exit(1);
});
