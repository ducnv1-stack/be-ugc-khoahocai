const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting Customer Code migration...');
  
  const customers = await prisma.customer.findMany({
    where: { code: null },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${customers.length} customers without codes.`);

  let count = 1000;
  for (const customer of customers) {
    const code = `KH${count}`;
    await prisma.customer.update({
      where: { id: customer.id },
      data: { code }
    });
    console.log(`Assigned ${code} to ${customer.name}`);
    count++;
  }

  console.log('Migration complete.');
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
