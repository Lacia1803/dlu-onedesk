/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@dlu.edu.vn' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      name: 'Admin Test',
      email: 'admin@dlu.edu.vn',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user ready:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
