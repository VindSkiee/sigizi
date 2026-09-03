-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SPPG_ADMIN', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MouStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "StockSource" AS ENUM ('SYSTEM_ORDER', 'MANUAL_ADJUSTMENT', 'BATCH_RETURN');

-- CreateEnum
CREATE TYPE "OperationalExpenseCategory" AS ENUM ('TRANSPORTATION', 'FUEL', 'VEHICLE_MAINTENANCE', 'ADMINISTRATIVE', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReportSnapshotStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "Sppg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mitraId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "province" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "village" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Sppg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "nib" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "province" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "district" TEXT,
    "village" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isMarketSeller" BOOLEAN NOT NULL DEFAULT false,
    "marketName" TEXT,
    "profileImage" TEXT,
    "openStatus" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "minOrderQty" DOUBLE PRECISION,
    "orderStep" DOUBLE PRECISION,
    "minThreshold" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceUpdatedAt" TIMESTAMP(3),
    "stockUpdatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "password" TEXT,
    "sppgId" TEXT,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "institutionType" TEXT,
    "totalBeneficiary" INTEGER NOT NULL,
    "address" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "sppgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mou" (
    "id" TEXT NOT NULL,
    "mouNumber" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MouStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "nibSnapshot" TEXT,
    "terms" JSONB,
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mou_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouItem" (
    "id" TEXT NOT NULL,
    "mouId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "minOrderQty" DOUBLE PRECISION,
    "maxOrderQty" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "sppgId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "mouId" TEXT,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "deliveryEvidence" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "cancelledById" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "marketMedianAtPurchase" DOUBLE PRECISION,
    "isWarningBypass" BOOLEAN NOT NULL DEFAULT false,
    "justificationNote" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "notes" TEXT,
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "reportKey" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menu" TEXT NOT NULL,
    "nutrition" JSONB,
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "beneficiaryCount" INTEGER,
    "beneficiaryNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "costPerPortion" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "costPerPortionStandard" INTEGER NOT NULL DEFAULT 10000,
    "totalBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetVariance" DOUBLE PRECISION,
    "failedReason" TEXT,
    "failedEvidence" TEXT,
    "failedAt" TIMESTAMP(3),
    "sppgId" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "inventoryStockId" TEXT,
    "name" TEXT,
    "unit" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "reportKey" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryStock" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "source" "StockSource" NOT NULL DEFAULT 'SYSTEM_ORDER',
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "initialQty" DOUBLE PRECISION NOT NULL,
    "remainingQty" DOUBLE PRECISION NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryStock_pkey" PRIMARY KEY ("id")
);

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
    "warningBypassCount" INTEGER NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX "Sppg_mitraId_key" ON "Sppg"("mitraId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_nib_key" ON "Supplier"("nib");

-- CreateIndex
CREATE INDEX "SupplierItem_supplierId_idx" ON "SupplierItem"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierItem_name_idx" ON "SupplierItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_sppgId_idx" ON "User"("sppgId");

-- CreateIndex
CREATE INDEX "User_supplierId_idx" ON "User"("supplierId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Beneficiary_sppgId_idx" ON "Beneficiary"("sppgId");

-- CreateIndex
CREATE INDEX "Beneficiary_institution_idx" ON "Beneficiary"("institution");

-- CreateIndex
CREATE UNIQUE INDEX "Mou_mouNumber_key" ON "Mou"("mouNumber");

-- CreateIndex
CREATE INDEX "Mou_sppgId_idx" ON "Mou"("sppgId");

-- CreateIndex
CREATE INDEX "Mou_supplierId_idx" ON "Mou"("supplierId");

-- CreateIndex
CREATE INDEX "Mou_status_idx" ON "Mou"("status");

-- CreateIndex
CREATE INDEX "Mou_startDate_idx" ON "Mou"("startDate");

-- CreateIndex
CREATE INDEX "Mou_endDate_idx" ON "Mou"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "MouItem_mouId_itemId_key" ON "MouItem"("mouId", "itemId");

-- CreateIndex
CREATE INDEX "Order_sppgId_idx" ON "Order"("sppgId");

-- CreateIndex
CREATE INDEX "Order_supplierId_idx" ON "Order"("supplierId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdById_idx" ON "Order"("createdById");

-- CreateIndex
CREATE INDEX "Order_mouId_idx" ON "Order"("mouId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_toStatus_idx" ON "OrderStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchNumber_key" ON "Batch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_reportKey_key" ON "Batch"("reportKey");

-- CreateIndex
CREATE INDEX "Batch_sppgId_idx" ON "Batch"("sppgId");

-- CreateIndex
CREATE INDEX "Batch_date_idx" ON "Batch"("date");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "Batch_createdById_idx" ON "Batch"("createdById");

-- CreateIndex
CREATE INDEX "BatchItem_batchId_idx" ON "BatchItem"("batchId");

-- CreateIndex
CREATE INDEX "BatchItem_itemId_idx" ON "BatchItem"("itemId");

-- CreateIndex
CREATE INDEX "BatchItem_inventoryStockId_idx" ON "BatchItem"("inventoryStockId");

-- CreateIndex
CREATE INDEX "Complaint_batchId_idx" ON "Complaint"("batchId");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_reportKey_idx" ON "Complaint"("reportKey");

-- CreateIndex
CREATE INDEX "InventoryStock_sppgId_itemId_idx" ON "InventoryStock"("sppgId", "itemId");

-- CreateIndex
CREATE INDEX "InventoryStock_remainingQty_idx" ON "InventoryStock"("remainingQty");

-- CreateIndex
CREATE INDEX "InventoryStock_expiredAt_idx" ON "InventoryStock"("expiredAt");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentLog_inventoryStockId_idx" ON "InventoryAdjustmentLog"("inventoryStockId");

-- CreateIndex
CREATE INDEX "InventoryAdjustmentLog_createdAt_idx" ON "InventoryAdjustmentLog"("createdAt");

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
ALTER TABLE "Sppg" ADD CONSTRAINT "Sppg_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Sppg"("mitraId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mou" ADD CONSTRAINT "Mou_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mou" ADD CONSTRAINT "Mou_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mou" ADD CONSTRAINT "Mou_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouItem" ADD CONSTRAINT "MouItem_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "Mou"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouItem" ADD CONSTRAINT "MouItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "Mou"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_inventoryStockId_fkey" FOREIGN KEY ("inventoryStockId") REFERENCES "InventoryStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentLog" ADD CONSTRAINT "InventoryAdjustmentLog_inventoryStockId_fkey" FOREIGN KEY ("inventoryStockId") REFERENCES "InventoryStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustmentLog" ADD CONSTRAINT "InventoryAdjustmentLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
