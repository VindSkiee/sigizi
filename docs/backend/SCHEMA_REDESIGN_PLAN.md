# Schema Redesign Plan — TraceBite Anti-Fraud GovTech Standards

**Tanggal:** 2026-07-10
**Author:** Backend Agent
**Status:** Ready for Implementation

---

## Ringkasan Eksekutif

Redesign schema Prisma SIGIZI untuk menerapkan **6 teknik database architecture anti-fraud** standar GovTech. Tujuan: membangun fondasi database yang kokoh dari MVP agar transisi ke Phase berikutnya tinggal memperdomain bisnis.

---

## Evaluasi 6 Teknik

| # | Teknik | MVP? | Alasan | Cost |
|---|--------|------|--------|------|
| 1 | Data Freezing (Snapshot Harga) | ✅ Wajib | Anti-manipulasi harga, chain of custody | Rendah |
| 2 | Append-Only Ledger (Stock Lot) | ✅ Wajib | Fondasi inventory anti-fraud | Medium |
| 3 | Audit Stamp Berlapis | ✅ Wajib | Standar GovTech accountability | Rendah |
| 4 | Strict DB Constraints | ✅ Wajib | Cegah cascade delete histori | Nol |
| 5 | Race Condition Handling | ✅ Wajib | Pattern concurrency benar dari awal | Rendah |
| 6 | Hash Integrity | ⚠️ Field Only | Field sekarang, logic Phase 2 | Nol |

---

## Arsitektur Data Freezing — Chain of Custody Harga

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HARGA FREEZING CHAIN (Anti-Manipulasi)               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SupplierItem.basePrice ←── HARGA CATALOGUE (bisa berubah oleh supplier)│
│          │                                                              │
│          │ Order dibuat                                                 │
│          ▼                                                              │
│  OrderItem.unitPrice ←── HARGA SAAT ORDER (snapshot, TIDAK BISA BERUBAH)│
│  OrderItem.purchasePrice ←─ HARGA FINAL (frozen setelah supplier OK)   │
│          │                                                              │
│          │ Delivery diterima                                            │
│          ▼                                                              │
│  StockLot.purchasePrice ←── HARGA YANG DIBAYAR (frozen dari OrderItem)  │
│          │                                                              │
│          │ Batch dibuat                                                 │
│          ▼                                                              │
│  BatchItem.unitPrice ←── HARGA DARI LOT (frozen dari StockLot)          │
│                                                                         │
│  ✅ Setiap lapisan MENGUNCI harga dari lapisan sebelumnya               │
│  ✅ Tidak ada yang bisa mengubah harga histori                          │
│  ✅ Audit trail lengkap: Batch → StockLot → Order → Supplier            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Arsitektur Stock Lot — Append-Only Ledger

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STOCK LOT SYSTEM (Buku Besar Stok)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  IN (Penerimaan)                                                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ StockLot #1: Supplier A, Beras, purchasePrice=12000     │          │
│  │   originalQty: 100kg, remainingQty: 65kg                │          │
│  │   → 35kg sudah dipakai batch #1, #2                     │          │
│  ├──────────────────────────────────────────────────────────┤          │
│  │ StockLot #2: Supplier B, Beras, purchasePrice=11500     │          │
│  │   originalQty: 200kg, remainingQty: 200kg               │          │
│  │   → belum dipakai (FIFO: lot #1 dipakai dulu)           │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  OUT (Pengeluaran)                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ BatchItem: Batch #1, Beras 15kg dari StockLot #1        │          │
│  │   unitPrice = 12000 (dari StockLot #1.purchasePrice)    │          │
│  │   → StockLot #1.remainingQty: 65 - 15 = 50             │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  BALANCE = SELECT SUM(remainingQty)                                    │
│            FROM StockLot                                                │
│            WHERE supplierId = X AND itemId = Y                         │
│                                                                         │
│  ✅ Setiap perubahan di StockLot DICATAT di InventoryTransaction       │
│  ✅ InventoryTransaction = INSERT ONLY, tidak pernah UPDATE/DELETE      │
│  ✅ Audit: "stok ini datang dari mana, harga berapa, kapan"            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Arsitektur Audit Trail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUDIT STAMP SYSTEM (Jejak Pelaku)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  createdBy/updatedBy (FK → User):                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ Order       → createdBy (SPPG admin yang buat order)    │          │
│  │ Batch       → createdBy (SPPG admin yang buat batch)    │          │
│  │ StockLot    → createdBy (Siapa yang input stok)         │          │
│  │ BatchItem   → createdBy (Siapa yang input bahan batch)  │          │
│  │ InventoryTxn→ createdBy (Siapa yang lakukan transaksi)  │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  OrderStatusHistory (Append-Only):                                     │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ orderId    → Order yang statusnya berubah                │          │
│  │ fromStatus → Status sebelumnya                           │          │
│  │ toStatus   → Status sesudahnya                           │          │
│  │ changedBy  → User yang mengubah                          │          │
│  │ notes      → Catatan: "Supplier konfirmasi stok ready"   │          │
│  │ evidenceUrl → Bukti: URL delivery receipt                 │          │
│  │ createdAt  → Kapan perubahan terjadi                     │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  ✅ Setiap transaksi bisa ditelusuri SIAPA yang melakukan              │
│  ✅ Status history tidak bisa dihapus/diubah                           │
│  ✅ Government audit compliant                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Daftar Model (Final)

| # | Model | Tipe | Keterangan |
|---|-------|------|------------|
| 1 | `User` | Core | User system (SPPG_ADMIN, SUPPLIER) |
| 2 | `Sppg` | Core | Satuan Pelayanan Pemberian Gizi |
| 3 | `Supplier` | Core | Supplier/pedagang |
| 4 | `SupplierItem` | Catalogue | Harga catalogue (bisa berubah) |
| 5 | `Beneficiary` | Master | Penerima manfaat |
| 6 | `Order` | Transaksi | Pemesanan SPPG → Supplier |
| 7 | `OrderItem` | Transaksi | Detail item order (harga frozen) |
| 8 | `OrderStatusHistory` | Audit | Jejak perubahan status order |
| 9 | `Batch` | Transaksi | Satu kali produksi makanan |
| 10 | `BatchItem` | Transaksi | Bahan baku batch (harga dari StockLot) |
| 11 | `StockLot` | Inventory | Satu lot stok dari satu delivery |
| 12 | `InventoryTransaction` | Audit | Append-only log pergerakan stok |
| 13 | `Complaint` | Transaksi | Keluhan masyarakat |

---

## Workflow Lengkap dengan Anti-Fraud

### Workflow 1: Pemesanan & Penerimaan Barang

```
Step 1: SPPG Admin buat Order
  → Input: supplierId, items[{itemId, quantity}]
  → OrderItem.unitPrice = SupplierItem.basePrice (snapshot)
  → OrderItem.purchasePrice = SupplierItem.basePrice (snapshot)
  → Order.status = PENDING
  → Audit: Order.createdById = currentUser.id

Step 2: Supplier terima & konfirmasi Order
  → Order.status = PENDING → CONFIRMED
  → Audit: OrderStatusHistory { fromStatus: PENDING, toStatus: CONFIRMED, changedBy }
  → Harga TIDAK BISA diubah lagi

Step 3: Supplier kirim barang
  → Order.status = CONFIRMED → DELIVERED
  → Audit: OrderStatusHistory { fromStatus: CONFIRMED, toStatus: DELIVERED, evidenceUrl }

Step 4: SPPG terima & verifikasi delivery
  → Order.status = DELIVERED → COMPLETED
  → UNTUK SETIAP OrderItem:
    → Buat StockLot:
        supplierId  = Order.supplierId
        itemId      = OrderItem.itemId
        orderId     = Order.id
        orderItemId = OrderItem.id
        purchasePrice = OrderItem.purchasePrice (FROZEN!)
        unit        = SupplierItem.unit
        originalQty = OrderItem.quantity
        remainingQty = OrderItem.quantity
        createdById = currentUser.id
    → Buat InventoryTransaction:
        type = IN
        stockLotId = newStockLot.id
        quantity = OrderItem.quantity
        referenceType = "ORDER_DELIVERY"
        referenceId = Order.id
        createdById = currentUser.id
  → Audit: OrderStatusHistory { fromStatus: DELIVERED, toStatus: COMPLETED }

Flow selesai. Stok tersedia untuk digunakan batch.
```

### Workflow 2: Pembuatan Batch (Anti-Fraud)

```
Step 1: SPPG Admin buat Batch
  → Input: menu, nutrition, allergens, beneficiaryCount, items[{itemId, quantity}]

Step 2: Sistem hitung bahan baku (FIFO)
  → UNTUK SETIAP item yang diminta:
    → Cari StockLot tersisa (remainingQty > 0) untuk itemId, urutkan: receivedAt ASC (FIFO)
    → Jika qty kurang dari lot pertama: ambil sebagian
    → Jika qty melebihi: ambil seluruh lot pertama, lanjut ke lot berikutnya
    → UNTUK SETIAP lot yang dipakai:
      → Dekrementasi StockLot.remainingQty (DENGAN $executeRaw ... FOR UPDATE)
      → Buat BatchItem:
          batchId     = newBatch.id
          stockLotId  = lot.id
          itemId      = lot.itemId
          quantity    = qtyAmbil
          unitPrice   = lot.purchasePrice (FROZEN DARI STOCK LOT!)
          subtotal    = quantity × unitPrice
          createdById = currentUser.id
      → Buat InventoryTransaction:
          type = OUT
          stockLotId = lot.id
          batchItemId = newBatchItem.id
          quantity = qtyAmbil
          referenceType = "BATCH_CONSUMPTION"
          referenceId = batch.id

Step 3: Sistem hitung totalCost
  → totalCost = SUM(BatchItem.subtotal) untuk semua item di batch ini
  → costPerPortion = totalCost / beneficiaryCount

Step 4: Sistem hitung dataHash (Phase 2)
  → dataHash = SHA-256(id + totalCost + sppgId + date + createdById)

Step 5: Simpan Batch
  → Audit: Batch.createdById = currentUser.id
```

### Workflow 3: Race Condition Safety

```typescript
// CONTOH: Batch creation dengan pessimistic locking
async createBatchWithItems(sppgId: string, userId: string, data: CreateBatchDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Lock StockLot rows yang akan dipakai (FOR UPDATE)
    const lockedLots = await tx.$executeRaw`
      SELECT * FROM "StockLot"
      WHERE "itemId" = ${data.itemId}
        AND "remainingQty" > 0
        AND "supplierId" IN (SELECT id FROM "Supplier" WHERE ...)
      ORDER BY "receivedAt" ASC
      FOR UPDATE
    `;

    // 2. Kurangi remainingQty (sudah aman karena locked)
    for (const lot of lotsToConsume) {
      await tx.stockLot.update({
        where: { id: lot.id },
        data: { remainingQty: { decrement: consumeQty } },
      });
    }

    // 3. Buat Batch + BatchItems + InventoryTransactions
    // ... (semua dalam transaction yang sama)

    return batch;
  });
}
```

---

## Rencana Implementasi — Detail Task

### Phase 1: Schema & Infrastructure (Hari 1)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 1.1 | Update Prisma schema (sudah selesai) | `prisma/schema.prisma` | ✅ Done |
| 1.2 | Generate Prisma migration SQL | `prisma/migrations/` | 15 menit |
| 1.3 | **Custom SQL migration: CHECK constraints** | `prisma/migrations/custom_constraints.sql` | 30 menit |
| 1.4 | Update shared types | `packages/shared/src/types/index.ts` | 30 menit |
| 1.5 | Update shared constants | `packages/shared/src/constants/index.ts` | 15 menit |
| 1.6 | Update seed script | `apps/backend/prisma/seed.ts` | 30 menit |
| 1.7 | Run migration + seed test | Terminal | 15 menit |

#### 1.3 Custom SQL Migration (CHECK Constraints)

```sql
-- File: prisma/migrations/YYYYMMDD_custom_constraints.sql

-- StockLot constraints
ALTER TABLE "StockLot" ADD CONSTRAINT chk_stocklot_remaining_qty
  CHECK ("remainingQty" >= 0);

ALTER TABLE "StockLot" ADD CONSTRAINT chk_stocklot_original_qty
  CHECK ("originalQty" > 0);

ALTER TABLE "StockLot" ADD CONSTRAINT chk_stocklot_purchase_price
  CHECK ("purchasePrice" >= 0);

-- BatchItem constraints
ALTER TABLE "BatchItem" ADD CONSTRAINT chk_batchitem_quantity
  CHECK ("quantity" > 0);

ALTER TABLE "BatchItem" ADD CONSTRAINT chk_batchitem_unit_price
  CHECK ("unitPrice" >= 0);

ALTER TABLE "BatchItem" ADD CONSTRAINT chk_batchitem_subtotal
  CHECK ("subtotal" >= 0);

-- OrderItem constraints
ALTER TABLE "OrderItem" ADD CONSTRAINT chk_orderitem_quantity
  CHECK ("quantity" > 0);

ALTER TABLE "OrderItem" ADD CONSTRAINT chk_orderitem_unit_price
  CHECK ("unitPrice" >= 0);

ALTER TABLE "OrderItem" ADD CONSTRAINT chk_orderitem_purchase_price
  CHECK ("purchasePrice" >= 0);

ALTER TABLE "OrderItem" ADD CONSTRAINT chk_orderitem_subtotal
  CHECK ("subtotal" >= 0);

-- Batch constraints
ALTER TABLE "Batch" ADD CONSTRAINT chk_batch_total_cost
  CHECK ("totalCost" >= 0);

ALTER TABLE "Batch" ADD CONSTRAINT chk_batch_cost_per_portion
  CHECK ("costPerPortion" >= 0);

ALTER TABLE "Batch" ADD CONSTRAINT chk_batch_beneficiary_count
  CHECK ("beneficiaryCount" > 0);

-- Beneficiary constraints
ALTER TABLE "Beneficiary" ADD CONSTRAINT chk_beneficiary_total
  CHECK ("totalBeneficiary" > 0);

-- InventoryTransaction constraints
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT chk_invtxn_quantity
  CHECK ("quantity" > 0);
```

---

### Phase 2: Core Backend Modules (Hari 1-2)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 2.1 | Create StockLot service | `modules/stock-lot/stock-lot.service.ts` | 2 jam |
| 2.2 | Create StockLot controller | `modules/stock-lot/stock-lot.controller.ts` | 1 jam |
| 2.3 | Create StockLot module | `modules/stock-lot/stock-lot.module.ts` | 30 menit |
| 2.4 | Create StockLot DTOs | `modules/stock-lot/dto/` | 1 jam |
| 2.5 | Create InventoryTransaction service | `modules/inventory/inventory.service.ts` | 1.5 jam |
| 2.6 | Create InventoryTransaction module | `modules/inventory/inventory.module.ts` | 30 menit |
| 2.7 | Create OrderStatusHistory service | `modules/order/order-status-history.service.ts` | 1 jam |
| 2.8 | Register new modules in AppModule | `app.module.ts` | 15 menit |

#### 2.1 StockLot Service — Pessimistic Locking Pattern

```typescript
@Injectable()
export class StockLotService {
  constructor(private prisma: PrismaService) {}

  /**
   * CONSUME FROM LOT — FIFO dengan Pessimistic Locking
   * Digunakan saat batch creation untuk mengurangi stok dari lot tertentu.
   * $executeRaw + FOR UPDATE mencegah race condition.
   */
  async consumeFromLot(
    lotId: string,
    quantity: number,
    tx: PrismaTransactionClient,
  ): Promise<StockLot> {
    // 1. Lock row StockLot (FOR UPDATE — tidak bisa dibaca transaction lain)
    const lockedLot = await tx.$queryRaw`
      SELECT * FROM "StockLot"
      WHERE id = ${lotId}
      FOR UPDATE
    `;

    if (!lockedLot || lockedLot.length === 0) {
      throw new NotFoundException(`Stock lot ${lotId} tidak ditemukan`);
    }

    const lot = lockedLot[0];

    if (lot.remainingQty < quantity) {
      throw new BadRequestException(
        `Stok tidak cukup. Tersedia: ${lot.remainingQty}, Diminta: ${quantity}`,
      );
    }

    // 2. Dekrementasi remainingQty
    return tx.stockLot.update({
      where: { id: lotId },
      data: {
        remainingQty: { decrement: quantity },
      },
    });
  }

  /**
   * RECEIVE FROM SUPPLIER — Membuat StockLot baru saat delivery diterima
   */
  async receiveDelivery(
    orderItemId: string,
    quantity: number,
    purchasePrice: number,
    userId: string,
    tx: PrismaTransactionClient,
  ): Promise<StockLot> {
    const orderItem = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true, item: true },
    });

    // Buat StockLot baru
    const stockLot = await tx.stockLot.create({
      data: {
        supplierId: orderItem.order.supplierId,
        itemId: orderItem.itemId,
        orderId: orderItem.order.id,
        orderItemId: orderItem.id,
        purchasePrice, // FROZEN dari OrderItem
        unit: orderItem.item.unit,
        originalQty: quantity,
        remainingQty: quantity,
        createdById: userId,
      },
    });

    // Catat di InventoryTransaction (append-only)
    await tx.inventoryTransaction.create({
      data: {
        type: 'IN',
        stockLotId: stockLot.id,
        quantity,
        referenceType: 'ORDER_DELIVERY',
        referenceId: orderItem.order.id,
        createdById: userId,
      },
    });

    return stockLot;
  }

  /**
   * GET STOCK BALANCE — Agregat dari StockLot
   * Bukan field di tabel, tapi kalkulasi dari remainingQty
   */
  async getStockBalance(supplierId: string, itemId: string): Promise<number> {
    const result = await this.prisma.stockLot.aggregate({
      where: {
        supplierId,
        itemId,
        remainingQty: { gt: 0 },
      },
      _sum: { remainingQty: true },
    });

    return result._sum.remainingQty ?? 0;
  }
}
```

---

### Phase 3: Order Module Enhancement (Hari 2)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 3.1 | Update Order service: add audit stamps | `modules/order/order.service.ts` | 1 jam |
| 3.2 | Add OrderStatusHistory logging on every status change | `modules/order/order.service.ts` | 1 jam |
| 3.3 | Add delivery receipt logic: create StockLot + InventoryTransaction | `modules/order/order.service.ts` | 2 jam |
| 3.4 | Update Order DTOs | `modules/order/dto/` | 1 jam |
| 3.5 | Update Order controller endpoints | `modules/order/order.controller.ts` | 30 menit |
| 3.6 | Add role-based guards (SPPG_ADMIN vs SUPPLIER) | `modules/order/` | 1 jam |

---

### Phase 4: Batch Module Enhancement (Hari 2-3)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 4.1 | Update Batch service: add BatchItem creation | `modules/batch/batch.service.ts` | 2 jam |
| 4.2 | Implement FIFO stock consumption | `modules/batch/batch.service.ts` | 2 jam |
| 4.3 | Add $transaction wrapping + pessimistic locking | `modules/batch/batch.service.ts` | 1.5 jam |
| 4.4 | Auto-compute totalCost & costPerPortion | `modules/batch/batch.service.ts` | 30 menit |
| 4.5 | Add dataHash computation (Phase 2 placeholder) | `modules/batch/batch.service.ts` | 30 menit |
| 4.6 | Update Batch DTOs (remove manual costPerPortion/totalCost) | `modules/batch/dto/` | 1 jam |
| 4.7 | Update Batch controller | `modules/batch/batch.controller.ts` | 30 menit |

#### 4.2 FIFO Stock Consumption — Core Algorithm

```typescript
/**
 * FIFO STOK CONSUMPTION
 * Mengambil stok dari lot paling awal dulu (First In, First Out).
 * Setiap pengambilan:
 *   1. Lock StockLot row (FOR UPDATE)
 *   2. Kurangi remainingQty
 *   3. Buat BatchItem (harga dari StockLot.purchasePrice)
 *   4. Catat InventoryTransaction (append-only)
 *
 * DI DALAM $transaction() — atomic!
 */
async consumeStockFifo(
  itemId: string,
  totalQtyNeeded: number,
  batchId: string,
  userId: string,
  tx: PrismaTransactionClient,
): Promise<BatchItem[]> {
  const batchItems: BatchItem[] = [];
  let remainingNeeded = totalQtyNeeded;

  // 1. Ambil semua lot yang masih ada stok, urutkan FIFO
  const lots = await tx.$queryRaw`
    SELECT * FROM "StockLot"
    WHERE "itemId" = ${itemId}
      AND "remainingQty" > 0
    ORDER BY "receivedAt" ASC, "id" ASC
    FOR UPDATE
  `;

  if (!lots || lots.length === 0) {
    throw new BadRequestException(
      `Stok item tidak tersedia atau kosong`,
    );
  }

  // 2. Ambil dari lot satu per satu sampai kebutuhan terpenuhi
  for (const lot of lots) {
    if (remainingNeeded <= 0) break;

    const consumeQty = Math.min(lot.remainingQty, remainingNeeded);
    const subtotal = consumeQty * lot.purchasePrice;

    // 2a. Kurangi remainingQty
    await tx.stockLot.update({
      where: { id: lot.id },
      data: { remainingQty: { decrement: consumeQty } },
    });

    // 2b. Buat BatchItem
    const batchItem = await tx.batchItem.create({
      data: {
        batchId,
        stockLotId: lot.id,
        itemId,
        quantity: consumeQty,
        unitPrice: lot.purchasePrice, // FROZEN dari StockLot
        subtotal,
        createdById: userId,
      },
    });

    // 2c. Catat InventoryTransaction (append-only)
    await tx.inventoryTransaction.create({
      data: {
        type: 'OUT',
        stockLotId: lot.id,
        batchItemId: batchItem.id,
        quantity: consumeQty,
        referenceType: 'BATCH_CONSUMPTION',
        referenceId: batchId,
        createdById: userId,
      },
    });

    batchItems.push(batchItem);
    remainingNeeded -= consumeQty;
  }

  if (remainingNeeded > 0) {
    throw new BadRequestException(
      `Stok tidak mencukupi. Masih kurang: ${remainingNeeded}`,
    );
  }

  return batchItems;
}
```

#### 4.4 Auto-Compute totalCost

```typescript
/**
 * Menghitung totalCost dari BatchItems (bukan input manual!)
 * Called setelah semua BatchItem dibuat.
 */
async computeBatchCosts(batchId: string, tx: PrismaTransactionClient) {
  const result = await tx.batchItem.aggregate({
    where: { batchId },
    _sum: { subtotal: true },
  });

  const totalCost = result._sum.subtotal ?? 0;
  const batch = await tx.batch.findUnique({ where: { id: batchId } });
  const costPerPortion = batch.beneficiaryCount
    ? totalCost / batch.beneficiaryCount
    : 0;

  await tx.batch.update({
    where: { id: batchId },
    data: { totalCost, costPerPortion },
  });
}
```

---

### Phase 5: Inventory Module (Hari 3)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 5.1 | Inventory dashboard: stock balance per supplier+item | `modules/inventory/inventory.service.ts` | 1 jam |
| 5.2 | Stock history: list InventoryTransaction dengan filter | `modules/inventory/inventory.service.ts` | 1 jam |
| 5.3 | Stock lot detail: remainingQty per lot | `modules/inventory/inventory.service.ts` | 30 menit |
| 5.4 | Inventory controller (read-only untuk dashboard) | `modules/inventory/inventory.controller.ts` | 1 jam |
| 5.5 | Inventory module | `modules/inventory/inventory.module.ts` | 15 menit |

---

### Phase 6: Supplier Module Enhancement (Hari 3)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 6.1 | Update SupplierItem: add description, minOrderQty, orderStep | `modules/supplier/supplier.service.ts` | 30 menit |
| 6.2 | Update SupplierItem DTOs | `modules/supplier/dto/` | 30 menit |
| 6.3 | Add audit stamps to Supplier creation | `modules/supplier/supplier.service.ts` | 15 menit |

---

### Phase 7: Shared Types & Frontend Sync (Hari 3-4)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 7.1 | Update shared types | `packages/shared/src/types/index.ts` | 1 jam |
| 7.2 | Update shared constants | `packages/shared/src/constants/index.ts` | 30 menit |
| 7.3 | Rebuild shared package | Terminal | 5 menit |

---

### Phase 8: Hash Integrity (Phase 2 — Post-MVP)

| # | Task | File | Estimasi |
|---|------|------|----------|
| 8.1 | Create hash service (SHA-256 computation) | `modules/batch/hash.service.ts` | 1 jam |
| 8.2 | Compute dataHash on batch creation | `modules/batch/batch.service.ts` | 30 menit |
| 8.3 | Verify dataHash on batch read (tamper detection) | `modules/batch/batch.service.ts` | 30 menit |
| 8.4 | Add batch verification endpoint | `modules/batch/batch.controller.ts` | 30 menit |

---

## Migration Strategy

### Karena ini adalah MVP dan belum ada production data:

1. **Hapus semua migration lama** (jika ada)
2. **Buat migration baru dari schema.prisma**
3. **Tambahkan custom SQL migration** untuk CHECK constraints
4. **Re-seed database**

```bash
cd apps/backend

# Hapus migration lama
rm -rf prisma/migrations

# Generate fresh migration
pnpm prisma migrate dev --name init_anti_fraud_schema

# Tambah CHECK constraints
# Copy custom_constraints.sql ke migration folder

# Re-seed
pnpm prisma:seed
```

---

## Arsitektur Final — ER Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │────▶│   Sppg   │◀────│  Beneficiary │
│ (audit)  │     └────┬─────┘     └──────────────┘
└────┬─────┘          │
     │                │
     │           ┌────┴─────┐
     │           │  Batch   │──── dataHash (anti-tamper)
     │           └────┬─────┘
     │                │
     │           ┌────┴──────┐
     │           │ BatchItem │──── unitPrice = StockLot.purchasePrice (frozen)
     │           └────┬──────┘
     │                │
     │           ┌────┴──────┐
     │           │ StockLot  │──── purchasePrice = OrderItem.purchasePrice (frozen)
     │           └────┬──────┘     remainingQty (lot balance)
     │                │
     │           ┌────┴──────────────────┐
     │           │ InventoryTransaction  │──── INSERT ONLY (append-only ledger)
     │           └───────────────────────┘
     │
     │           ┌──────────┐     ┌──────────────┐
     ├──────────▶│  Order   │────▶│ OrderItem    │──── purchasePrice (frozen)
     │           └────┬─────┘     └──────────────┘
     │                │
     │           ┌────┴──────────────────┐
     │           │ OrderStatusHistory    │──── INSERT ONLY (status audit)
     │           └───────────────────────┘
     │
     │           ┌──────────────┐
     └──────────▶│  Supplier    │
                 └──────┬───────┘
                        │
                   ┌────┴─────────┐
                   │ SupplierItem │──── basePrice (catalogue, bisa berubah)
                   └──────────────┘
```

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| FIFO logic bugs → stok negatif | High | CHECK constraint `remainingQty >= 0` + unit tests |
| Race condition saat jam sibuk | High | `SELECT ... FOR UPDATE` + `$transaction` |
| Harga tidak konsisten | High | Architecture: setiap layer freeze harga sebelumnya |
| Migration gagal | Medium | Test di dev dulu, backup sebelum apply |
| Frontend belum sync | Low | Shared types update → rebuild → frontend auto-update |
| Performance query aggregate | Low | Index di `StockLot(supplierId, itemId, remainingQty)` |

---

## Verification Checklist

Setelah implementasi, verifikasi:

- [ ] `prisma migrate` berhasil tanpa error
- [ ] CHECK constraints aktif (test: insert negative qty → error)
- [ ] `onDelete: Restrict` aktif (test: delete Supplier dengan StockLot → error)
- [ ] StockLot creation saat delivery → InventoryTransaction type=IN tercatat
- [ ] Batch creation → BatchItem dibuat dengan harga dari StockLot
- [ ] Batch creation → remainingQty StockLot berkurang
- [ ] Batch creation → InventoryTransaction type=OUT tercatat
- [ ] totalCost = SUM(BatchItem.subtotal) — bukan input manual
- [ ] costPerPortion = totalCost / beneficiaryCount — otomatis
- [ ] OrderStatusHistory tercatat setiap perubahan status
- [ ] createdBy/updatedBy terisi di semua tabel transaksional
- [ ] FIFO bekerja: lot pertama dipakai dulu
- [ ] dataHash field ada di Batch (logic Phase 2)
