-- AlterTable: Add price validation snapshot fields to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "marketMedianAtPurchase" DOUBLE PRECISION;
ALTER TABLE "OrderItem" ADD COLUMN "isWarningBypass" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OrderItem" ADD COLUMN "justificationNote" TEXT;

-- AlterTable: Add warningBypassCount to ReportSnapshot
ALTER TABLE "ReportSnapshot" ADD COLUMN "warningBypassCount" INTEGER NOT NULL DEFAULT 0;
