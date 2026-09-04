-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCommodity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "referencePrice" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ItemCommodity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");

-- CreateIndex
CREATE INDEX "ItemCategory_name_idx" ON "ItemCategory"("name");

-- CreateIndex
CREATE INDEX "ItemCategory_isActive_idx" ON "ItemCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCommodity_name_key" ON "ItemCommodity"("name");

-- CreateIndex
CREATE INDEX "ItemCommodity_categoryId_idx" ON "ItemCommodity"("categoryId");

-- CreateIndex
CREATE INDEX "ItemCommodity_name_idx" ON "ItemCommodity"("name");

-- CreateIndex
CREATE INDEX "ItemCommodity_isActive_idx" ON "ItemCommodity"("isActive");

-- AddForeignKey
ALTER TABLE "ItemCommodity" ADD CONSTRAINT "ItemCommodity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Add commodityId to SupplierItem
ALTER TABLE "SupplierItem" ADD COLUMN "commodityId" TEXT;

-- CreateIndex
CREATE INDEX "SupplierItem_commodityId_idx" ON "SupplierItem"("commodityId");

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "ItemCommodity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
