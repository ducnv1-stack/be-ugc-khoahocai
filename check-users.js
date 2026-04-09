const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: { select: { name: true } }
    }
  });
  console.log('Users found:', users.length);
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

check();
