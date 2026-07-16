/*
  Warnings:

  - Added the required column `createdById` to the `InventoryStock` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockSource" AS ENUM ('SYSTEM_ORDER', 'MANUAL_ADJUSTMENT', 'BATCH_RETURN');

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "InventoryStock" DROP CONSTRAINT "InventoryStock_orderItemId_fkey";

-- AlterTable
ALTER TABLE "InventoryStock" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "source" "StockSource" NOT NULL DEFAULT 'SYSTEM_ORDER';

-- AlterTable
ALTER TABLE "SupplierItem" ADD COLUMN     "minThreshold" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InventoryAdjustmentLog" (
    "id" TEXT NOT NULL,
    "inventoryStockId" TEXT NOT NULL,
    "adjustmentQty" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryAdjustmentLog_inventoryStockId_idx" ON "InventoryAdjustmentLog"("inventoryStockId");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentLog_createdAt_idx" ON "InventoryAdjustmentLog"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryStock_expiredAt_idx" ON "InventoryStock"("expiredAt");

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentLog" ADD CONSTRAINT "InventoryAdjustmentLog_inventoryStockId_fkey" FOREIGN KEY ("inventoryStockId") REFERENCES "InventoryStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentLog" ADD CONSTRAINT "InventoryAdjustmentLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
