-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "isMarketSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketName" TEXT;
