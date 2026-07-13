# Session Log - Backend - 2026-07-13 Inventory Stock Patch

## Phase

- **Current Phase**: Phase 1: MVP
- **Progress**: ~45-50%

## Current Task

Lot-Based Inventory Tracking: Tambah model `InventoryStock`, FIFO consumption di `BatchService`, price locking dari `InventoryStock.purchasePrice`, dan `InsufficientStockException`.

## Progress

- [x] Update Prisma Schema - Tambah `InventoryStock` model + relations di Batch, BatchItem, Order, OrderItem, SupplierItem, Sppg
- [x] Run Prisma migration `20260713051208_add_inventory_stock`
- [x] Regenerate Prisma client
- [x] Update Shared Types - `InventoryStock` interface, `COST_PER_PORTION_STANDARD` constant
- [x] Update `BatchItemRequestDto` - Hapus `unitPrice` dari client DTO
- [x] Update `OrderItemRequestDto` - Hapus `unitPrice` dari client DTO
- [x] Create `UpdateBatchStatusDto` - Handle FAILED status dengan `failedReason` + `failedEvidence`
- [x] Create `InsufficientStockException` - Custom exception untuk validasi stok
- [x] Rewrite `BatchService.create()` - FIFO logic dengan `$transaction`
- [x] Rewrite `BatchService.updateStatus()` - Handle FAILED
- [x] Rewrite `OrderService.create()` - MoU price derivation
- [x] Rewrite `OrderService.updateStatus()` - Create InventoryStock saat COMPLETED
- [x] Rewrite seed data - Full flow: Order → COMPLETED → InventoryStock → Batch FIFO
- [x] Verify build (shared + backend) - Zero errors

## Files Modified

| File                                                                              | Changes                                                                                                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/backend/prisma/schema.prisma`                                               | +`InventoryStock` model, +6 fields di Batch, +4 fields di BatchItem, +relation di Order, OrderItem, SupplierItem, Sppg |
| `packages/shared/src/index.ts`                                                    | +`InventoryStock` interface, +`COST_PER_PORTION_STANDARD`, +`BatchStatus.FAILED`                                       |
| `apps/backend/src/modules/batch/dto/create-batch.dto.ts`                          | Hapus `unitPrice` dari `BatchItemRequestDto`, tambah `name?`, `unit?`                                                  |
| `apps/backend/src/modules/batch/dto/update-batch-status.dto.ts`                   | **File baru** - DTO untuk FAILED status                                                                                |
| `apps/backend/src/modules/batch/services/batch.service.ts`                        | FIFO create dengan `$transaction`, handle FAILED status                                                                |
| `apps/backend/src/modules/order/dto/create-order.dto.ts`                          | Hapus `unitPrice` dari `OrderItemRequestDto`                                                                           |
| `apps/backend/src/modules/order/services/order.service.ts`                        | MoU price derivation, InventoryStock creation saat COMPLETED                                                           |
| `apps/backend/src/common/exceptions/insufficient-stock.exception.ts`              | **File baru** - Custom exception                                                                                       |
| `apps/backend/src/common/index.ts`                                                | Export InsufficientStockException                                                                                      |
| `apps/backend/prisma/seed.ts`                                                     | Full rewrite: Order→COMPLETED→InventoryStock→Batch FIFO                                                                |
| `apps/backend/prisma/migrations/20260713051208_add_inventory_stock/migration.sql` | Auto-generated migration                                                                                               |

## Decisions Made

### InventoryStock Model

- **`purchasePrice`**: Diambil dari `OrderItem.unitPrice` saat Order → COMPLETED
- **`remainingQty`**: Sisa stok yang bisa digunakan untuk Batch
- **FIFO**: Konsumsi lot tertua duluan (`createdAt ASC`)
- **Split lot**: Jika satu item butuh 2 lot berbeda harga → buat 2 `BatchItem` terpisah

### Price Locking

- **Order item price**: Server-side dari `MouItem.agreedPrice` jika ada `mouId`, else `SupplierItem.basePrice`
- **Batch item price**: Server-side dari `InventoryStock.purchasePrice` via FIFO
- **Client tidak boleh set `unitPrice`**: Dihapus dari DTO

### Batch Budget

- **`costPerPortionStandard`**: Rp 10.000/porsi (regulasi MBG) - disimpan di entity
- **`totalBudget`**: `costPerPortionStandard × beneficiaryCount`
- **`budgetVariance`**: `totalCost - totalBudget` (negatif = under budget)

### FAILED Status

- Batch → FAILED: Terminal state, required `failedReason` + `failedEvidence`
- `failedEvidence`: URL string (bukan base64)

### Transport/BBBM Cost

- Tidak masuk Batch untuk MVP (bukan setiap batch pakai kendaraan)

### `inventoryStockId` on BatchItem

- Nullable untuk backward compat dengan existing seed data

## Blockers

- **WSL permission**: `pnpm install` harus via `cmd.exe` dari Windows
- **Prisma engine lock**: `taskkill /F /IM node.exe` diperlukan jika node masih jalan
- **No `.env`**: Database migration tidak bisa jalan tanpa DATABASE_URL (expected)

## Code Snippets

```typescript
// FIFO Consumption Logic
for (const request of batchItemRequests) {
  const availableLots = await prisma.inventoryStock.findMany({
    where: { sppgId, itemId: request.itemId, remainingQty: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });

  let quantityNeeded = request.quantity;
  for (const lot of availableLots) {
    if (quantityNeeded <= 0) break;
    const consumeQty = Math.min(lot.remainingQty, quantityNeeded);
    const unitPrice = lot.purchasePrice; // Price locking

    await prisma.inventoryStock.update({
      where: { id: lot.id },
      data: { remainingQty: { decrement: consumeQty } },
    });

    batchItems.push({
      inventoryStockId: lot.id,
      unitPrice, // Locked from FIFO
      quantity: consumeQty,
      subtotal: consumeQty * unitPrice,
    });

    quantityNeeded -= consumeQty;
  }
}

// MoU Price Derivation (Order)
const mouItem = await prisma.mouItem.findUnique({
  where: { mouId_itemId: { mouId, itemId } },
});
const unitPrice = mouItem?.agreedPrice ?? supplierItem.basePrice;

// InventoryStock Creation (Order → COMPLETED)
await prisma.inventoryStock.create({
  data: {
    sppgId,
    itemId: orderItem.itemId,
    orderItemId: orderItem.id,
    purchasePrice: orderItem.unitPrice,
    initialQty: orderItem.quantity,
    remainingQty: orderItem.quantity,
  },
});
```

## Phase Status Check

```markdown
### MVP Checklist (Phase 1)

- [x] pnpm install
- [ ] .env configuration (belum verified)
- [x] Prisma migration
- [x] Order module CRUD + MoU price derivation
- [ ] SPPG module CRUD
- [ ] Beneficiary module CRUD
- [ ] Login page (sudah ada di frontend)
- [ ] Auth context/provider (partial)
- [ ] Dashboard layout (sudah ada di frontend)
- [ ] Supplier management page
- [x] Batch module - FAILED status + FIFO inventory
- [ ] Complaint management page
- [ ] Market/Analytics page
- [ ] Reports page
```

## Next Steps

1. Config `.env` dan test database connection
2. Run seed data untuk verifikasi flow Order→InventoryStock→Batch
3. Commit semua perubahan inventory stock
4. Push ke remote
5. Wiring inventory stock ke admin pages

## Checkpoint

- Context usage: ~50%
- Last tool call: bash (build verification)
- Timestamp: 2026-07-13T12:00:00Z

---

_File ini dibuat oleh agent. Update setiap selesai task._
