-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "beneficiaryNames" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Beneficiary" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SupplierItem" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
