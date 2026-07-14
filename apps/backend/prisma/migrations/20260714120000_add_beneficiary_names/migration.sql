-- AlterTable
ALTER TABLE "Batch" ADD COLUMN "beneficiaryNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
