const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const customers = await prisma.customer.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { assignedSale: true }
  });
  console.log(JSON.stringify(customers, null, 2));
  process.exit(0);
}

check();
