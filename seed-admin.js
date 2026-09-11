/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin account (matches TESTING.md + Playwright e2e)
  const adminHash = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dlu.edu.vn' },
    update: { password: adminHash, role: 'ADMIN' },
    create: {
      name: 'Admin Test',
      email: 'admin@dlu.edu.vn',
      password: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin user ready:', admin.email, '/ admin');

  // Tech account (matches TESTING.md + Playwright e2e)
  const techHash = await bcrypt.hash('tech', 10);
  const tech = await prisma.user.upsert({
    where: { email: 'tech@dlu.edu.vn' },
    update: { password: techHash, role: 'TECHNICIAN' },
    create: {
      name: 'Technician Test',
      email: 'tech@dlu.edu.vn',
      password: techHash,
      role: 'TECHNICIAN',
    },
  });
  console.log('Tech user ready:', tech.email, '/ tech');
}

main().catch(console.error).finally(() => prisma.$disconnect());
