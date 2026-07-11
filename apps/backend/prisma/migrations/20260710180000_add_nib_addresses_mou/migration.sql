-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SPPG_ADMIN', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MouStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

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
CREATE TABLE "Sppg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mitraId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    -- Alamat terstruktur
    "address" TEXT,
    "province" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "village" TEXT,
    "postalCode" TEXT,

    -- Koordinat GPS
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

    -- Alamat terstruktur
    "address" TEXT,
    "province" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "village" TEXT,
    "postalCode" TEXT,

    -- Koordinat GPS
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

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
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierItem_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mou" (
    "id" TEXT NOT NULL,
    "mouNumber" TEXT NOT NULL,

    -- Pihak-pihak
    "sppgId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    -- Masa kontrak
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    -- Status
    "status" "MouStatus" NOT NULL DEFAULT 'DRAFT',

    -- Dokumen & ketentuan
    "title" TEXT NOT NULL,
    "nibSnapshot" TEXT,
    "terms" JSONB,
    "documentUrl" TEXT,
    "notes" TEXT,

    -- Audit
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

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "reportKey" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menu" TEXT NOT NULL,
    "nutrition" JSONB,
    "allergens" TEXT[],
    "beneficiaryCount" INTEGER,
    "costPerPortion" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_sppgId_idx" ON "User"("sppgId");
CREATE INDEX "User_supplierId_idx" ON "User"("supplierId");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE UNIQUE INDEX "Sppg_mitraId_key" ON "Sppg"("mitraId");
CREATE INDEX "Sppg_province_idx" ON "Sppg"("province");
CREATE INDEX "Sppg_regency_idx" ON "Sppg"("regency");

CREATE UNIQUE INDEX "Supplier_nib_key" ON "Supplier"("nib");
CREATE INDEX "Supplier_province_idx" ON "Supplier"("province");
CREATE INDEX "Supplier_regency_idx" ON "Supplier"("regency");
CREATE INDEX "Supplier_district_idx" ON "Supplier"("district");

CREATE INDEX "SupplierItem_supplierId_idx" ON "SupplierItem"("supplierId");
CREATE INDEX "SupplierItem_name_idx" ON "SupplierItem"("name");

CREATE INDEX "Beneficiary_sppgId_idx" ON "Beneficiary"("sppgId");
CREATE INDEX "Beneficiary_institution_idx" ON "Beneficiary"("institution");

CREATE UNIQUE INDEX "Mou_mouNumber_key" ON "Mou"("mouNumber");
CREATE INDEX "Mou_sppgId_idx" ON "Mou"("sppgId");
CREATE INDEX "Mou_supplierId_idx" ON "Mou"("supplierId");
CREATE INDEX "Mou_status_idx" ON "Mou"("status");
CREATE INDEX "Mou_startDate_idx" ON "Mou"("startDate");
CREATE INDEX "Mou_endDate_idx" ON "Mou"("endDate");

CREATE UNIQUE INDEX "MouItem_mouId_itemId_key" ON "MouItem"("mouId", "itemId");

CREATE INDEX "Order_sppgId_idx" ON "Order"("sppgId");
CREATE INDEX "Order_supplierId_idx" ON "Order"("supplierId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdById_idx" ON "Order"("createdById");
CREATE INDEX "Order_mouId_idx" ON "Order"("mouId");

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE UNIQUE INDEX "Batch_batchNumber_key" ON "Batch"("batchNumber");
CREATE UNIQUE INDEX "Batch_reportKey_key" ON "Batch"("reportKey");
CREATE INDEX "Batch_sppgId_idx" ON "Batch"("sppgId");
CREATE INDEX "Batch_batchNumber_idx" ON "Batch"("batchNumber");
CREATE INDEX "Batch_date_idx" ON "Batch"("date");
CREATE INDEX "Batch_status_idx" ON "Batch"("status");
CREATE INDEX "Batch_createdById_idx" ON "Batch"("createdById");

CREATE INDEX "BatchItem_batchId_idx" ON "BatchItem"("batchId");
CREATE INDEX "BatchItem_itemId_idx" ON "BatchItem"("itemId");

CREATE INDEX "Complaint_batchId_idx" ON "Complaint"("batchId");
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX "Complaint_reportKey_idx" ON "Complaint"("reportKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Mou" ADD CONSTRAINT "Mou_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mou" ADD CONSTRAINT "Mou_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mou" ADD CONSTRAINT "Mou_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MouItem" ADD CONSTRAINT "MouItem_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "Mou"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MouItem" ADD CONSTRAINT "MouItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "Mou"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Batch" ADD CONSTRAINT "Batch_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "Sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchItem" ADD CONSTRAINT "BatchItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

-- Supplier
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_nib_not_empty" CHECK (LENGTH("nib") > 0);
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_province_not_empty" CHECK (LENGTH("province") > 0);
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_regency_not_empty" CHECK (LENGTH("regency") > 0);
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_district_not_empty" CHECK (LENGTH("district") > 0);
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90));
ALTER TABLE "Supplier" ADD CONSTRAINT "supplier_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180));

-- Sppg
ALTER TABLE "Sppg" ADD CONSTRAINT "sppg_province_not_empty" CHECK (LENGTH("province") > 0);
ALTER TABLE "Sppg" ADD CONSTRAINT "sppg_regency_not_empty" CHECK (LENGTH("regency") > 0);
ALTER TABLE "Sppg" ADD CONSTRAINT "sppg_district_not_empty" CHECK (LENGTH("district") > 0);
ALTER TABLE "Sppg" ADD CONSTRAINT "sppg_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90));
ALTER TABLE "Sppg" ADD CONSTRAINT "sppg_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180));

-- SupplierItem
ALTER TABLE "SupplierItem" ADD CONSTRAINT "supplieritem_baseprice_positive" CHECK ("basePrice" > 0);
ALTER TABLE "SupplierItem" ADD CONSTRAINT "supplieritem_minorderqty_positive" CHECK ("minOrderQty" IS NULL OR "minOrderQty" > 0);
ALTER TABLE "SupplierItem" ADD CONSTRAINT "supplieritem_orderstep_positive" CHECK ("orderStep" IS NULL OR "orderStep" > 0);

-- Beneficiary
ALTER TABLE "Beneficiary" ADD CONSTRAINT "beneficiary_totalpositive" CHECK ("totalBeneficiary" > 0);

-- Order
ALTER TABLE "Order" ADD CONSTRAINT "order_total_positive" CHECK ("total" >= 0);

-- OrderItem
ALTER TABLE "OrderItem" ADD CONSTRAINT "orderitem_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "orderitem_unitprice_positive" CHECK ("unitPrice" > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "orderitem_subtotal_positive" CHECK ("subtotal" > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "orderitem_subtotal_formula" CHECK (ABS("subtotal" - ("quantity" * "unitPrice")) < 0.01);

-- MoU
ALTER TABLE "Mou" ADD CONSTRAINT "mou_start_before_end" CHECK ("startDate" < "endDate");
ALTER TABLE "Mou" ADD CONSTRAINT "mou_number_format" CHECK ("mouNumber" ~ '^MOU-[0-9]{8}-[0-9]{3}$');

-- MouItem
ALTER TABLE "MouItem" ADD CONSTRAINT "mouitem_agreedprice_positive" CHECK ("agreedPrice" > 0);
ALTER TABLE "MouItem" ADD CONSTRAINT "mouitem_minorderqty_positive" CHECK ("minOrderQty" IS NULL OR "minOrderQty" > 0);
ALTER TABLE "MouItem" ADD CONSTRAINT "mouitem_maxorderqty_positive" CHECK ("maxOrderQty" IS NULL OR "maxOrderQty" > 0);

-- Batch
ALTER TABLE "Batch" ADD CONSTRAINT "batch_totalcost_positive" CHECK ("totalCost" >= 0);
ALTER TABLE "Batch" ADD CONSTRAINT "batch_costperportion_positive" CHECK ("costPerPortion" >= 0);
ALTER TABLE "Batch" ADD CONSTRAINT "batch_beneficiarycount_positive" CHECK ("beneficiaryCount" IS NULL OR "beneficiaryCount" > 0);

-- BatchItem
ALTER TABLE "BatchItem" ADD CONSTRAINT "batchitem_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "BatchItem" ADD CONSTRAINT "batchitem_unitprice_positive" CHECK ("unitPrice" > 0);
ALTER TABLE "BatchItem" ADD CONSTRAINT "batchitem_subtotal_positive" CHECK ("subtotal" > 0);
ALTER TABLE "BatchItem" ADD CONSTRAINT "batchitem_subtotal_formula" CHECK (ABS("subtotal" - ("quantity" * "unitPrice")) < 0.01);

-- Complaint
ALTER TABLE "Complaint" ADD CONSTRAINT "complaint_reportkey_format" CHECK ("reportKey" ~ '^[A-Z0-9]{6,8}$');
