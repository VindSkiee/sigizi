-- AlterTable
ALTER TABLE "BatchItem" ADD COLUMN     "inventoryStockId" TEXT;

-- CreateTable
CREATE TABLE "InventoryStock" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "initialQty" DOUBLE PRECISION NOT NULL,
    "remainingQty" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryStock_sppgId_itemId_idx" ON "InventoryStock"("sppgId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryStock_remainingQty_idx" ON "InventoryStock"("remainingQty");

-- CreateIndex
CREATE INDEX "BatchItem_inventoryStockId_idx" ON "BatchItem"("inventoryStockId");

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_inventoryStockId_fkey" FOREIGN KEY ("inventoryStockId") REFERENCES "InventoryStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
