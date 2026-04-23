/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseNature" AS ENUM ('FIXED', 'VARIABLE');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_PAID';

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleStudent" DROP CONSTRAINT "ScheduleStudent_scheduleId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cccd" TEXT,
ADD COLUMN     "code" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoiceIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "memoEditable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "recurringGroupId" TEXT;

-- AlterTable
ALTER TABLE "SystemExpense" ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "costCenter" TEXT NOT NULL DEFAULT 'OPERATIONS',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "nature" "ExpenseNature" NOT NULL DEFAULT 'VARIABLE',
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "referenceType" TEXT,
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "vendorName" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "SystemExpense_date_status_idx" ON "SystemExpense"("date", "status");

-- CreateIndex
CREATE INDEX "SystemExpense_category_subCategory_idx" ON "SystemExpense"("category", "subCategory");

-- CreateIndex
CREATE INDEX "SystemExpense_costCenter_idx" ON "SystemExpense"("costCenter");

-- AddForeignKey
ALTER TABLE "ScheduleStudent" ADD CONSTRAINT "ScheduleStudent_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemExpense" ADD CONSTRAINT "SystemExpense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemExpense" ADD CONSTRAINT "SystemExpense_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
