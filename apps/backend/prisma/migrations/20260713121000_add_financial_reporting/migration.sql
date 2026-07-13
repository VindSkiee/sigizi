-- CreateEnum
CREATE TYPE "OperationalExpenseCategory" AS ENUM ('TRANSPORTATION', 'FUEL', 'VEHICLE_MAINTENANCE', 'ADMINISTRATIVE', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReportSnapshotStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "OperationalExpense" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "category" "OperationalExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSnapshot" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReportSnapshotStatus" NOT NULL DEFAULT 'FINAL',
    "totalPortions" INTEGER NOT NULL DEFAULT 0,
    "totalCogs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProcured" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOpex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetVariance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payload" JSONB,
    "pdfPath" TEXT,
    "pdfHash" TEXT,
    "generatedById" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationalExpense_sppgId_expenseDate_idx" ON "OperationalExpense"("sppgId", "expenseDate");

-- CreateIndex
CREATE INDEX "OperationalExpense_category_idx" ON "OperationalExpense"("category");

-- CreateIndex
CREATE INDEX "OperationalExpense_createdById_idx" ON "OperationalExpense"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ReportSnapshot_sppgId_type_periodKey_key" ON "ReportSnapshot"("sppgId", "type", "periodKey");

-- CreateIndex
CREATE INDEX "ReportSnapshot_sppgId_type_status_idx" ON "ReportSnapshot"("sppgId", "type", "status");

-- CreateIndex
CREATE INDEX "ReportSnapshot_startDate_idx" ON "ReportSnapshot"("startDate");

-- CreateIndex
CREATE INDEX "ReportSnapshot_endDate_idx" ON "ReportSnapshot"("endDate");

-- AddForeignKey
ALTER TABLE "OperationalExpense" ADD CONSTRAINT "OperationalExpense_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalExpense" ADD CONSTRAINT "OperationalExpense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalExpense" ADD CONSTRAINT "OperationalExpense_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSnapshot" ADD CONSTRAINT "ReportSnapshot_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSnapshot" ADD CONSTRAINT "ReportSnapshot_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
