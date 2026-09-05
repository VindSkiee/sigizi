-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BGN';

-- DropForeignKey
ALTER TABLE "Sppg" DROP CONSTRAINT "Sppg_mitraId_fkey";

-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "allergens" DROP DEFAULT,
ALTER COLUMN "beneficiaryNames" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Batch_batchNumber_idx" ON "Batch"("batchNumber");
