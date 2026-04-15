import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.scheduleStudent.count();
  const students = await prisma.scheduleStudent.findMany({
    include: {
      schedule: {
        include: {
          course: true
        }
      },
      customer: true
    }
  });
  console.log('Total ScheduleStudent count:', count);
  console.log('Sample assignments:', JSON.stringify(students.slice(0, 5), null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
