-- AlterEnum
ALTER TYPE "BatchStatus" ADD VALUE 'FAILED';

-- DropIndex
DROP INDEX "Sppg_province_idx";

-- DropIndex
DROP INDEX "Sppg_regency_idx";

-- DropIndex
DROP INDEX "Supplier_district_idx";

-- DropIndex
DROP INDEX "Supplier_province_idx";

-- DropIndex
DROP INDEX "Supplier_regency_idx";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "budgetVariance" DOUBLE PRECISION,
ADD COLUMN     "costPerPortionStandard" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failedEvidence" TEXT,
ADD COLUMN     "failedReason" TEXT,
ADD COLUMN     "totalBudget" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BatchItem" ADD COLUMN     "name" TEXT,
ADD COLUMN     "unit" TEXT;
