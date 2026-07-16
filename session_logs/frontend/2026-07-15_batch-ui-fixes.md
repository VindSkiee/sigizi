# Session Log - Frontend - 2026-07-15

## Current Task
Fix batch card UI, inventory page cleanup, dan modal improvements

## Progress
- [x] Fix button "Lihat Detail" position konsisten (flexbox)
- [x] Truncate beneficiary names max 2 + badge "+X lainnya"
- [x] Tambah active state efek pada button (scale + shadow)
- [x] Tambah confirmation modal untuk button "Selesai"
- [x] Fix FailBatchModal z-index (createPortal + z-[9998])
- [x] Fix modal tidak tertutup setelah Selesai/Batal/Gagal
- [x] Fix failedEvidence wajib diisi (backend requirement)
- [x] Ganti input URL → FileUpload (base64) untuk bukti kegagalan
- [x] Tambah image preview popup untuk bukti gambar
- [x] Ubah "Adjust" → "Edit" di inventory table
- [x] Sembunyikan kolom "Kedaluarsa" dari inventory table
- [x] Hapus input "Tanggal kedaluwarsa" dari ManualStockModal
- [x] Hapus card "Akan Kadaluarsa" dari stats (3 columns)
- [x] Sembunyikan item dengan stok 0 (soft delete)

## Files Modified
- `apps/portal/src/components/features/batch/BatchCard.tsx` - Flexbox layout + truncate names + active button
- `apps/portal/src/components/features/batch/BatchDetailModal.tsx` - ConfirmModal untuk "Selesai" + image preview popup
- `apps/portal/src/components/features/batch/FailBatchModal.tsx` - createPortal + z-[9998] + FileUpload + validasi
- `apps/portal/src/app/admin/batches/page.tsx` - setSelectedBatch(null) di handleComplete, handleFailConfirm, confirmCancelBatch
- `apps/portal/src/components/features/admin/inventory/InventoryTable.tsx` - Hapus kolom Kedaluarsa + ubah "Adjust" → "Edit"
- `apps/portal/src/components/features/admin/inventory/ManualStockModal.tsx` - Hapus input expiredAt
- `apps/portal/src/components/features/admin/inventory/InventoryStatsCards.tsx` - Hapus card "Akan Kadaluarsa" + 3 columns
- `apps/portal/src/app/admin/inventory/page.tsx` - Hapus expiringSoonCount + filter stok 0

## Decisions Made
- Beneficiary truncation: max 2 names + badge "+X lainnya"
- Button active state: active:scale-[0.98] + active:shadow-inner
- FailBatchModal: createPortal + z-[9998] untuk fix z-index conflict
- Evidence upload: base64 approach (frontend only, backend tidak diubah)
- Image evidence: popup modal, PDF: link ke tab baru
- Kedaluarsa: di-hide dari frontend, backend tidak diubah
- Soft delete stok 0: filter di page.tsx

## Blockers
- Backend belum set expiredAt untuk SYSTEM_ORDER (menunggu keputusan tim backend)
- StockHistoryAdjustment type mismatch (id, email missing) - belum difix

## Next Steps
1. Fix type mismatch StockHistoryAdjustment (id, email)
2. Backend: set expiredAt saat order COMPLETED
3. Test all modal flows end-to-end

## Checkpoint
- Context usage: ~60%
- Last tool call: write (session log)
- Timestamp: 2026-07-15
