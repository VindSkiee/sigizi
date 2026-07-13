# Session Log - Backend - 2026-07-13 Inventory Module Enhancement

## Phase

- **Current Phase**: Phase 1: MVP
- **Progress**: ~50-55%

## Current Task

Lot-Based Inventory Management: Manual stock input, stock adjustment with audit trail, expiration date tracking, low stock alerts, event-driven batch rollback (BATCH_RETURN), SPPG_ADMIN access control.

## Progress

- [x] Update schema.prisma: StockSource enum, InventoryStock fields, InventoryAdjustmentLog model, User relations, SupplierItem.minThreshold
- [x] Run Prisma migration + regenerate client
- [x] Create DTOs: CreateManualStockDto, AdjustStockDto, StockQueryDto
- [x] Create InventoryService with all business logic
- [x] Update InventoryEventHandler: batch.cancelled + batch.failed handlers
- [x] Create InventoryController with guarded endpoints
- [x] Update InventoryModule
- [x] Create BatchEvents: BatchCancelledEvent, BatchFailedEvent
- [x] Update BatchService: emit events on CANCELLED/FAILED
- [x] Update shared types: StockSource, InventoryStock, InventoryAdjustmentLog, SupplierItem.minThreshold
- [x] Update API.md documentation
- [x] Build & verify zero errors (backend)

## Files Modified

| File                                                                                       | Changes                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/backend/prisma/schema.prisma`                                                        | +StockSource enum, +InventoryStock fields (source, expiredAt, createdById, notes), +InventoryAdjustmentLog model, +SupplierItem.minThreshold |
| `apps/backend/prisma/migrations/20260713112523_add_inventory_adjustment_log/migration.sql` | **New migration**                                                                                                                            |
| `apps/backend/src/modules/inventory/dto/create-manual-stock.dto.ts`                        | **New file**                                                                                                                                 |
| `apps/backend/src/modules/inventory/dto/adjust-stock.dto.ts`                               | **New file**                                                                                                                                 |
| `apps/backend/src/modules/inventory/dto/stock-query.dto.ts`                                | **New file**                                                                                                                                 |
| `apps/backend/src/modules/inventory/dto/index.ts`                                          | **New file**                                                                                                                                 |
| `apps/backend/src/modules/inventory/inventory.service.ts`                                  | **New file** - Full business logic                                                                                                           |
| `apps/backend/src/modules/inventory/inventory.controller.ts`                               | **New file** - All endpoints                                                                                                                 |
| `apps/backend/src/modules/inventory/inventory-event.handler.ts`                            | Updated: +batch.cancelled, +batch.failed handlers                                                                                            |
| `apps/backend/src/modules/inventory/inventory.module.ts`                                   | Updated: +Service, +Controller, +PrismaModule                                                                                                |
| `apps/backend/src/modules/batch/events/batch.events.ts`                                    | **New file** - BatchCancelledEvent, BatchFailedEvent                                                                                         |
| `apps/backend/src/modules/batch/services/batch.service.ts`                                 | Updated: +EventEmitter2, +event emission                                                                                                     |
| `packages/shared/src/index.ts`                                                             | +StockSource enum, +InventoryAdjustmentLog interface, +SupplierItem.minThreshold                                                             |
| `docs/API.md`                                                                              | +Inventory Management section, +Role-Based Access table                                                                                      |

## Decisions Made

### Schema Design

- **StockSource enum**: SYSTEM_ORDER, MANUAL_ADJUSTMENT, BATCH_RETURN
- **InventoryAdjustmentLog**: Separate audit trail model with reason, description, changedById
- **SupplierItem.minThreshold**: Per-item threshold for low stock alerts, nullable for global fallback
- **InventoryStock**: Added source, expiredAt, createdById, notes fields

### Event-Driven Architecture

- **Batch Cancelled/Failed**: Emit events from BatchService → InventoryEventHandler creates BATCH_RETURN lots
- **100% Return**: Batch rollback returns 100% of allocated quantity as new lot
- **Separate Adjustment**: Damaged goods handled via Stock Adjustment with SPOILAGE reason

### Access Control

- **All endpoints**: `@UseGuards(JwtAuthGuard, RolesGuard)`
- **All mutations**: `@Roles(Role.SPPG_ADMIN)` only
- **User extraction**: `@CurrentUser()` decorator

### Stock Adjustment Workflow

- **Atomic operation**: $transaction for remainingQty update + InventoryAdjustmentLog creation
- **Validation**: Cannot reduce below zero
- **Audit trail**: Every adjustment logged with reason and changedById

### Low Stock Alert

- **Per-item threshold**: SupplierItem.minThreshold
- **Global fallback**: defaultThreshold parameter (default: 10)
- **Query**: Aggregation of remainingQty grouped by itemId

## API Endpoints

| Method | Endpoint                   | Description         | Access     |
| ------ | -------------------------- | ------------------- | ---------- |
| POST   | /api/inventory/manual      | Input stok manual   | SPPG_ADMIN |
| PATCH  | /api/inventory/:id/adjust  | Penyesuaian stok    | SPPG_ADMIN |
| GET    | /api/inventory             | List semua lot stok | SPPG_ADMIN |
| GET    | /api/inventory/balance     | Real-time balance   | SPPG_ADMIN |
| GET    | /api/inventory/valuation   | Nilai aset stok     | SPPG_ADMIN |
| GET    | /api/inventory/alerts      | Low stock alerts    | SPPG_ADMIN |
| GET    | /api/inventory/:id/history | Riwayat penyesuaian | SPPG_ADMIN |

## Blockers

- **WSL pnpm install**: Harus via cmd.exe dari Windows
- **Prisma engine lock**: Taskkill jika node masih jalan
- **LSP errors**: Prisma client perlu regenerate setelah schema update

## Code Snippets

```typescript
// Stock Adjustment
async adjustStockLot(stockId: string, dto: AdjustStockDto, userId: string) {
  const stock = await this.prisma.inventoryStock.findUnique({ where: { id: stockId } });
  const newRemainingQty = stock.remainingQty + dto.adjustmentQty;

  if (newRemainingQty < 0) {
    throw new BadRequestException(`Stok akan menjadi negatif`);
  }

  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryStock.update({
      where: { id: stockId },
      data: { remainingQty: newRemainingQty },
    });

    const log = await tx.inventoryAdjustmentLog.create({
      data: {
        inventoryStockId: stockId,
        adjustmentQty: dto.adjustmentQty,
        reason: dto.reason,
        description: dto.description,
        changedById: userId,
      },
    });

    return { stock: updated, adjustment: log };
  });
}

// Batch Rollback Event
@OnEvent("batch.cancelled")
async handleBatchCancelled(event: BatchCancelledEvent) {
  const returnableItems = event.items.filter(item => item.inventoryStockId !== null);

  await this.prisma.$transaction(async (tx) => {
    for (const item of returnableItems) {
      await tx.inventoryStock.create({
        data: {
          sppgId: event.sppgId,
          itemId: item.itemId,
          source: StockSource.BATCH_RETURN,
          purchasePrice: item.unitPrice,
          initialQty: item.quantity,
          remainingQty: item.quantity,
          createdById: event.cancelledById,
          notes: `Pengembalian dari batch ${event.batchNumber}`,
        },
      });
    }
  });
}
```

## Phase Status Check

```markdown
### MVP Checklist (Phase 1)

- [x] pnpm install
- [ ] .env configuration (belum verified)
- [x] Prisma migration
- [x] Order module CRUD + MoU price derivation
- [x] Order module enhancement (CANCELLED, Auth, Roles, Events)
- [x] Inventory module (Manual stock, Adjustment, Alerts, Batch rollback)
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

1. Test Inventory workflow end-to-end (manual stock → adjustment → balance)
2. Test Batch rollback (cancelled → BATCH_RETURN lots created)
3. Test Low stock alerts
4. Wire Inventory management ke frontend pages

## Checkpoint

- Context usage: ~65%
- Last tool call: bash (build verification)
- Timestamp: 2026-07-13T16:00:00Z

---

_File ini dibuat oleh agent. Update setiap selesai task._
