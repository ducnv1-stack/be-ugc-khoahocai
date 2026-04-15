"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=check-schedules.js.map