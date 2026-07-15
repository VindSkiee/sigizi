-- AlterTable: Add deletedAt field to SupplierItem
ALTER TABLE "SupplierItem" ADD COLUMN "deletedAt" TIMESTAMP(3);
