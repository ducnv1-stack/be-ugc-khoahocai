-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "totalSessions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isLead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "maxCapacity" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "SystemExpense" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemExpense_pkey" PRIMARY KEY ("id")
);
