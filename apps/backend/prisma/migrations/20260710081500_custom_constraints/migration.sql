-- ============================================================================
-- Custom CHECK Constraints — TraceBite Anti-Fraud GovTech Standards
-- Migration: 20260710081500_custom_constraints
-- 
-- Tujuan: Menambahkan validasi data di level database yang tidak bisa dibypass
--         oleh aplikasi. Ini adalah lapisan pertahanan terakhir (defense in depth).
--
-- Naming Convention: chk_{table}_{field}_{condition}
-- ============================================================================

-- ============================================================================
-- 1. SUPPLIER ITEM — Harga catalogue & order minimum
-- ============================================================================

-- basePrice tidak boleh negatif
ALTER TABLE "SupplierItem"
  ADD CONSTRAINT chk_supplieritem_baseprice_positive
  CHECK ("basePrice" >= 0);

-- minOrderQty harus positif (ketika diisi)
ALTER TABLE "SupplierItem"
  ADD CONSTRAINT chk_supplieritem_minorderqty_positive
  CHECK ("minOrderQty" IS NULL OR "minOrderQty" > 0);

-- orderStep harus positif (ketika diisi)
ALTER TABLE "SupplierItem"
  ADD CONSTRAINT chk_supplieritem_orderstep_positive
  CHECK ("orderStep" IS NULL OR "orderStep" > 0);

-- name minimal 2 karakter
ALTER TABLE "SupplierItem"
  ADD CONSTRAINT chk_supplieritem_name_length
  CHECK (LENGTH("name") >= 2);


-- ============================================================================
-- 2. BENEFICIARY — Jumlah penerima manfaat
-- ============================================================================

-- totalBeneficiary harus positif
ALTER TABLE "Beneficiary"
  ADD CONSTRAINT chk_beneficiary_totalbeneficiary_positive
  CHECK ("totalBeneficiary" > 0);

-- name minimal 2 karakter
ALTER TABLE "Beneficiary"
  ADD CONSTRAINT chk_beneficiary_name_length
  CHECK (LENGTH("name") >= 2);

-- institution minimal 2 karakter
ALTER TABLE "Beneficiary"
  ADD CONSTRAINT chk_beneficiary_institution_length
  CHECK (LENGTH("institution") >= 2);


-- ============================================================================
-- 3. ORDER — Total pemesanan
-- ============================================================================

-- total tidak boleh negatif
ALTER TABLE "Order"
  ADD CONSTRAINT chk_order_total_positive
  CHECK ("total" >= 0);


-- ============================================================================
-- 4. ORDER ITEM — Harga snapshot & qty
-- ============================================================================

-- quantity harus positif
ALTER TABLE "OrderItem"
  ADD CONSTRAINT chk_orderitem_quantity_positive
  CHECK ("quantity" > 0);

-- unitPrice tidak boleh negatif (harga catalogue saat order)
ALTER TABLE "OrderItem"
  ADD CONSTRAINT chk_orderitem_unitprice_positive
  CHECK ("unitPrice" >= 0);

-- purchasePrice tidak boleh negatif (harga final yang disepakati)
ALTER TABLE "OrderItem"
  ADD CONSTRAINT chk_orderitem_purchaseprice_positive
  CHECK ("purchasePrice" >= 0);

-- subtotal tidak boleh negatif
ALTER TABLE "OrderItem"
  ADD CONSTRAINT chk_orderitem_subtotal_positive
  CHECK ("subtotal" >= 0);


-- ============================================================================
-- 5. BATCH — Biaya produksi
-- ============================================================================

-- totalCost tidak boleh negatif
ALTER TABLE "Batch"
  ADD CONSTRAINT chk_batch_totalcost_positive
  CHECK ("totalCost" >= 0);

-- costPerPortion tidak boleh negatif
ALTER TABLE "Batch"
  ADD CONSTRAINT chk_batch_costperportion_positive
  CHECK ("costPerPortion" >= 0);

-- beneficiaryCount harus positif (ketika diisi)
ALTER TABLE "Batch"
  ADD CONSTRAINT chk_batch_beneficiarycount_positive
  CHECK ("beneficiaryCount" IS NULL OR "beneficiaryCount" > 0);

-- menu minimal 3 karakter
ALTER TABLE "Batch"
  ADD CONSTRAINT chk_batch_menu_length
  CHECK (LENGTH("menu") >= 3);


-- ============================================================================
-- 6. BATCH ITEM — Bahan baku yang digunakan
-- ============================================================================

-- quantity harus positif
ALTER TABLE "BatchItem"
  ADD CONSTRAINT chk_batchitem_quantity_positive
  CHECK ("quantity" > 0);

-- unitPrice tidak boleh negatif (harga dari StockLot, frozen)
ALTER TABLE "BatchItem"
  ADD CONSTRAINT chk_batchitem_unitprice_positive
  CHECK ("unitPrice" >= 0);

-- subtotal tidak boleh negatif
ALTER TABLE "BatchItem"
  ADD CONSTRAINT chk_batchitem_subtotal_positive
  CHECK ("subtotal" >= 0);


-- ============================================================================
-- 7. STOCK LOT — Buku Besar Stok (Append-Only Ledger)
-- ============================================================================

-- purchasePrice tidak boleh negatif (harga yang dibayar)
ALTER TABLE "StockLot"
  ADD CONSTRAINT chk_stocklot_purchaseprice_positive
  CHECK ("purchasePrice" >= 0);

-- originalQty harus positif (qty awal saat diterima)
ALTER TABLE "StockLot"
  ADD CONSTRAINT chk_stocklot_originalqty_positive
  CHECK ("originalQty" > 0);

-- remainingQty tidak boleh negatif (sisa stok)
ALTER TABLE "StockLot"
  ADD CONSTRAINT chk_stocklot_remainingqty_positive
  CHECK ("remainingQty" >= 0);

-- remainingQty tidak boleh melebihi originalQty
-- (Stok yang tersisa tidak mungkin lebih dari yang diterima awal)
ALTER TABLE "StockLot"
  ADD CONSTRAINT chk_stocklot_remainingqty_lte_original
  CHECK ("remainingQty" <= "originalQty");


-- ============================================================================
-- 8. INVENTORY TRANSACTION — Append-only log
-- ============================================================================

-- quantity harus positif (selalu positif, type menentukan IN/OUT)
ALTER TABLE "InventoryTransaction"
  ADD CONSTRAINT chk_inventorytransaction_quantity_positive
  CHECK ("quantity" > 0);

-- referenceType harus salah satu dari yang diperbolehkan
ALTER TABLE "InventoryTransaction"
  ADD CONSTRAINT chk_inventorytransaction_referencetype_valid
  CHECK ("referenceType" IN ('ORDER_DELIVERY', 'BATCH_CONSUMPTION'));


-- ============================================================================
-- 9. SUPPLIER — Validasi NPWP
-- ============================================================================

-- NPWP harus 10-15 karakter (standar Indonesia)
ALTER TABLE "Supplier"
  ADD CONSTRAINT chk_supplier_npwp_length
  CHECK (LENGTH("npwp") BETWEEN 10 AND 15);

-- name minimal 2 karakter
ALTER TABLE "Supplier"
  ADD CONSTRAINT chk_supplier_name_length
  CHECK (LENGTH("name") >= 2);


-- ============================================================================
-- 10. USER — Validasi dasar
-- ============================================================================

-- name minimal 2 karakter
ALTER TABLE "User"
  ADD CONSTRAINT chk_user_name_length
  CHECK (LENGTH("name") >= 2);

-- email harus mengandung @
ALTER TABLE "User"
  ADD CONSTRAINT chk_user_email_format
  CHECK ("email" LIKE '%@%');


-- ============================================================================
-- 11. SPPG — Validasi dasar
-- ============================================================================

-- name minimal 2 karakter
ALTER TABLE "Sppg"
  ADD CONSTRAINT chk_sppg_name_length
  CHECK (LENGTH("name") >= 2);


-- ============================================================================
-- 12. COMPLAINT — Validasi deskripsi
-- ============================================================================

-- description minimal 10 karakter
ALTER TABLE "Complaint"
  ADD CONSTRAINT chk_complaint_description_length
  CHECK (LENGTH("description") >= 10);

-- reportKey harus 8 karakter
ALTER TABLE "Complaint"
  ADD CONSTRAINT chk_complaint_reportkey_length
  CHECK (LENGTH("reportKey") = 8);


-- ============================================================================
-- 13. ORDER STATUS HISTORY — Validasi transisi status
-- ============================================================================

-- fromStatus dan toStatus tidak boleh sama (harus ada perubahan)
ALTER TABLE "OrderStatusHistory"
  ADD CONSTRAINT chk_orderstatushistory_status_different
  CHECK ("fromStatus" != "toStatus");


-- ============================================================================
-- DONE
-- ============================================================================
-- 
-- Total: 34 CHECK constraints
-- 
-- Setelah menjalankan migration ini, verifikasi dengan:
-- 
-- 1. Test INSERT yang melanggar constraint:
--    INSERT INTO "StockLot" ("remainingQty", ...) VALUES (-5, ...);
--    → Harus gagal dengan error: chk_stocklot_remainingqty_positive
-- 
-- 2. Test INSERT yang valid:
--    INSERT INTO "StockLot" ("remainingQty", ...) VALUES (100, ...);
--    → Harus berhasil
-- 
-- 3. Lihat semua constraints:
--    SELECT conname, contype 
--    FROM pg_constraint 
--    WHERE connamespace = 'public'::regnamespace 
--    AND contype = 'c'
--    ORDER BY conname;
--
-- ============================================================================
