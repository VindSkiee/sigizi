# SIGIZI Marketplace Backend - Changelog

**Last Updated**: 2026-09-04
**Scope**: Backend only (`apps/backend/`)

---

## Frontend Implementation Priority

Implement in this order. Each phase builds on the previous.

| Priority | Domain                 | Why first                                                  |
| -------- | ---------------------- | ---------------------------------------------------------- |
| **P0**   | File Upload            | Everything with images depends on this                     |
| **P1**   | Supplier Management    | CRUD + profile with images, needed before market browsing  |
| **P2**   | Market Search & Prices | Main marketplace browsing experience                       |
| **P3**   | Item Detail            | Individual item view with supplier info, needs market data |
| **P4**   | Marketplace Filtering  | Zero-stock/deleted exclusion (already in backend)          |

---

## P0: File Upload

### New Endpoints

```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file (File)
200: { "url": "/uploads/items/1693420800000-abc123.jpg" }

POST /api/upload/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file (File)
200: { "url": "/uploads/profiles/1693420800000-abc123.jpg" }
```

### Constraints

| Rule          | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| Allowed types | `image/jpeg`, `image/png`, `image/webp`                            |
| Max size      | 5MB                                                                |
| Auth          | Required (any logged-in user)                                      |
| Storage       | `apps/backend/uploads/items/` and `apps/backend/uploads/profiles/` |
| Filename      | `${Date.now()}-${randomBytes(8).hex}${ext}` (server-controlled)    |

### Static File Serving

Files served at `/uploads/...` via `app.useStaticAssets()` in `main.ts`.
No `/api` prefix — global prefix does not apply to static assets.

Example: `http://localhost:3001/uploads/items/1693420800000-abc123.jpg`

### Client Workflow

1. Upload image: `POST /api/upload/image` → get `{ url: "/uploads/items/xxx.jpg" }`
2. Create/update item with `image: "/uploads/items/xxx.jpg"` in JSON body
3. Upload profile: `POST /api/upload/profile` → get `{ url: "/uploads/profiles/xxx.jpg" }`
4. Update profile with `profileImage: "/uploads/profiles/xxx.jpg"` in JSON body
5. Render images: `${API_BASE_URL}/uploads/items/xxx.jpg`

### Files

| File                                     | Change                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| `src/types/multer.d.ts`                  | **NEW** — Local Express.Multer type declaration           |
| `src/common/upload/upload.module.ts`     | **NEW** — Upload module                                   |
| `src/common/upload/upload.controller.ts` | **NEW** — `POST /upload/image` and `POST /upload/profile` |
| `src/main.ts`                            | Added `useStaticAssets` for `/uploads`                    |
| `src/app.module.ts`                      | Registered `UploadModule`                                 |
| `.gitignore`                             | Added `uploads/`                                          |

---

## P1: Supplier Management

### Schema Changes

#### Supplier Model — New Fields

| Field          | Type      | Default | Description                           |
| -------------- | --------- | ------- | ------------------------------------- |
| `profileImage` | `String?` | null    | Supplier profile image URL            |
| `openStatus`   | `Boolean` | `true`  | Whether supplier is open for business |

#### SupplierItem Model — New Fields

| Field            | Type        | Default | Description                 |
| ---------------- | ----------- | ------- | --------------------------- |
| `image`          | `String?`   | null    | Item image URL              |
| `stock`          | `Float`     | `0`     | Current stock quantity      |
| `priceUpdatedAt` | `DateTime?` | null    | Last price change timestamp |
| `stockUpdatedAt` | `DateTime?` | null    | Last stock change timestamp |

### Upload-Enabled Supplier Endpoints

| Endpoint                                 | File field | Storage dir         | Merges into        |
| ---------------------------------------- | ---------- | ------------------- | ------------------ |
| `POST /api/suppliers/:id/items`          | `file`     | `uploads/items/`    | `dto.image`        |
| `PATCH /api/suppliers/:id/items/:itemId` | `file`     | `uploads/items/`    | `dto.image`        |
| `PUT /api/suppliers/me/profile`          | `file`     | `uploads/profiles/` | `dto.profileImage` |

All three accept `multipart/form-data` with optional `file` field. The uploaded URL is merged into the DTO body automatically.

### Timestamp Refresh Logic

- **`addItem()`**: Both `priceUpdatedAt` and `stockUpdatedAt` set to `new Date()`
- **`updateItem()`**: Uses `"basePrice" in dto` / `"stock" in dto` checks (presence-based, NOT value comparison)
  - If field is **present** in dto → refresh timestamp, even if value is identical
  - If field is **absent** → no timestamp refresh
- Fields `updatedAt`, `priceUpdatedAt`, `stockUpdatedAt` are NOT exposed in DTOs (server-managed only)

### Files

| File                                                                  | Change                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `prisma/schema.prisma`                                                | Added 6 new fields across Supplier + SupplierItem                  |
| `prisma/migrations/20260903000000_init_clean/migration.sql`           | **NEW** — Complete DDL migration                                   |
| `prisma/seed.ts`                                                      | Removed sections 5-13 ( Beneficiaries through OperationalExpenses) |
| `src/modules/supplier/domain/entities/supplier.entity.ts`             | Added `profileImage`, `openStatus`                                 |
| `src/modules/supplier/domain/repositories/supplier.repository.ts`     | Updated all interfaces                                             |
| `src/modules/supplier/application/dto/create-supplier.dto.ts`         | Added `profileImage`, `openStatus`                                 |
| `src/modules/supplier/application/dto/update-supplier-profile.dto.ts` | Added `profileImage`, `openStatus`                                 |
| `src/modules/supplier/application/dto/create-supplier-item.dto.ts`    | Added `image`, `stock`                                             |
| `src/modules/supplier/application/dto/update-supplier-item.dto.ts`    | Added `image`, `stock`                                             |
| `src/modules/supplier/application/services/supplier.service.ts`       | Timestamp refresh logic                                            |
| `src/modules/supplier/infrastructure/prisma/supplier.repository.ts`   | Updated all Prisma mappings                                        |
| `src/modules/supplier/presentation/http/supplier.controller.ts`       | Added `FileInterceptor` to POST items, PATCH items, PUT profile    |

---

## P2: Market Search & Prices

### Modified Endpoints

| Endpoint                      | Change                                                 |
| ----------------------------- | ------------------------------------------------------ |
| `GET /market/prices`          | Sorting, pagination, stock/freshness/openStatus fields |
| `GET /market/regions`         | Pagination                                             |
| `GET /market/markets`         | Pagination                                             |
| `GET /market/anomalies`       | Pagination                                             |
| `GET /market/het-suggestion`  | Pagination (via getMarketPricesRaw)                    |
| `POST /market/validate-price` | Unchanged (no pagination)                              |

### Sorting

- **Non-GPS mode**: `stock desc`, `priceUpdatedAt desc`, `stockUpdatedAt desc`, `id asc`
- **GPS mode**: `distanceKm asc` (primary), then stock/freshness/id as secondary

### Pagination

All collection endpoints return `{ data, meta }`:

```typescript
{
  data: T,
  meta: {
    page: number,       // default: 1
    limit: number,      // default: 20, max: 100
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

**Fetch-all in-memory pagination**: Entire scope set is fetched, sorted, then sliced. Acceptable for MVP.

**HET/anomaly calculations**: Always use full resolved dataset BEFORE pagination.

### New Fields in Supplier Response

Each supplier in `GET /market/prices` now includes:

| Field            | Type             | Description                        |
| ---------------- | ---------------- | ---------------------------------- |
| `stock`          | `number`         | Current stock quantity             |
| `priceUpdatedAt` | `string \| null` | ISO timestamp of last price change |
| `stockUpdatedAt` | `string \| null` | ISO timestamp of last stock change |
| `openStatus`     | `boolean`        | `true` = buka, `false` = tutup     |

### Marketplace Filtering

All market queries exclude:

- Soft-deleted items (`deletedAt = null`)
- Zero-stock items (`stock > 0`)

Applied in `fetchSupplierItems()`, `getDistinctMarkets()`, and `getSupplierRegions()`.

### Files

| File                                                      | Change                                                 |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `src/modules/market/dto/market-paginated-response.dto.ts` | **NEW** — Generic `{ data, meta }` wrapper             |
| `src/modules/market/dto/market-location-filter.dto.ts`    | Added `page`, `limit` fields                           |
| `src/modules/market/services/market.service.ts`           | Sorting, pagination, stock/freshness fields, filtering |
| `src/modules/market/controllers/market.controller.ts`     | Pagination params, new routes                          |

---

## P3: Item Detail

### New Endpoint

```
GET /market/items/:id
Authorization: Bearer <token>
```

Returns a single item with its full supplier profile. Requires JWT.

### Response Shape

```json
{
  "item": {
    "id": "clx...",
    "name": "Beras Premium",
    "unit": "kg",
    "basePrice": 12000,
    "description": "Beras premium grade A",
    "minOrderQty": 10,
    "orderStep": 5,
    "isAvailable": true,
    "image": "/uploads/items/xxx.jpg",
    "stock": 150,
    "priceUpdatedAt": "2026-09-03T00:00:00.000Z",
    "stockUpdatedAt": "2026-09-03T00:00:00.000Z",
    "createdAt": "2026-07-09T00:00:00.000Z"
  },
  "supplier": {
    "id": "clx...",
    "name": "UD. Sumber Rejeki",
    "phone": "08123456789",
    "profileImage": "/uploads/profiles/xxx.jpg",
    "address": "Jl. Raya Purwakarta No. 1",
    "province": "Jawa Barat",
    "regency": "Purwakarta",
    "district": "Babakancikao",
    "latitude": -6.5563,
    "longitude": 107.4439,
    "openStatus": true,
    "isMarketSeller": true,
    "marketName": "Pasar Cibeunying"
  }
}
```

### Behavior

- Returns `404` if item not found or soft-deleted (`deletedAt` is set)
- Direct Prisma query with `include: { supplier: true }` (no cross-module dependency)

### Client Reorganization Suggestion

Move the **"Buat Pesanan" (Create Order)** flow to the item detail page:

- Show full item info + supplier profile
- "Pesan Sekarang" button opens order form with item pre-selected
- Users get full context before ordering

### Files

| File                                                  | Change                                           |
| ----------------------------------------------------- | ------------------------------------------------ |
| `src/modules/market/services/market.service.ts`       | Added `getItemDetail(id)` method                 |
| `src/modules/market/controllers/market.controller.ts` | Added `GET /items/:id` route with `JwtAuthGuard` |

---

## P5: Order Status Flow + Payment Gate

**Date**: 2026-09-04

### Updated Flow

```
PENDING → CONFIRMED → DELIVERED → COMPLETED → CANCELLED
                           ↑
                    confirmPayment (DELIVERED only)
```

### Status Machine

| From      | To        | Actor                | Gate                    |
| --------- | --------- | -------------------- | ----------------------- |
| PENDING   | CONFIRMED | SUPPLIER             | —                       |
| CONFIRMED | DELIVERED | SUPPLIER             | —                       |
| DELIVERED | COMPLETED | SPPG_ADMIN           | `paidAt` must be set    |
| COMPLETED | CANCELLED | SPPG_ADMIN           | `validateStockRollback` |
| PENDING   | CANCELLED | SPPG_ADMIN, SUPPLIER | `reason` required       |
| CONFIRMED | CANCELLED | SPPG_ADMIN, SUPPLIER | `reason` required       |
| DELIVERED | CANCELLED | SPPG_ADMIN           | `reason` required       |

### Payment Gate

- `confirmPayment` only accepts orders with status `DELIVERED`
- `DELIVERED → COMPLETED` checks `order.paidAt !== null`
- If `paidAt` is not set, transition is rejected with error message
- `order.completed` event is NOT emitted if payment gate fails

### Changes

| File                                                  | Change                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/shared/src/index.ts:967`                    | `COMPLETED → [OrderStatus.CANCELLED]` (was `[]`)                   |
| `src/modules/order/services/order.service.ts:37`      | `COMPLETED → [OS.CANCELLED]` (was `[]`)                            |
| `src/modules/order/services/order.service.ts:48`      | Added `COMPLETED→CANCELLED: [SPPG_ADMIN]` role                     |
| `src/modules/order/services/order.service.ts:437-443` | Payment gate: throws if `!order.paidAt` on `DELIVERED → COMPLETED` |
| `src/modules/order/services/order.service.ts:508-515` | `confirmPayment` accepts `DELIVERED` only (was `CONFIRMED`)        |

### Behavior After

- `confirmPayment` can only be called when order is `DELIVERED`
- `DELIVERED → COMPLETED` is blocked until payment is confirmed
- `COMPLETED → CANCELLED` now works (was dead code before)
- `validateStockRollback()` is now reachable
- No changes to database, events, InventoryStock, DTOs, or controller routes

---

## P6: Order Stock Reservation + Stock Guard

**Date**: 2026-09-04

### Summary

Saat create order, `SupplierItem.stock` di-decrement secara atomik. Saat order dibatalkan, stock di-restore. Seluruh operasi berada dalam satu Prisma transaction.

### Flow

```
CREATE ORDER:
  ├─ Filter: deletedAt=null, stock>0, isAvailable
  ├─ Validate: quantity > 0, quantity <= stock
  ├─ Atomic decrement: SupplierItem.stock -= quantity (inside $transaction)
  └─ If concurrent request wins race → entire transaction rolls back

CANCEL ORDER (any status → CANCELLED):
  └─ Restore: SupplierItem.stock += quantity (inside same $transaction)
```

### Changes

| File                                                  | Change                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/modules/order/services/order.service.ts:7`       | Import `PrismaClient` from `@prisma/client`                                     |
| `src/modules/order/services/order.service.ts:10-14`   | `TxClient` type alias for transaction client                                    |
| `src/modules/order/services/order.service.ts:191-197` | `findMany` filters `deletedAt: null`, `stock: { gt: 0 }`, selects `stock`       |
| `src/modules/order/services/order.service.ts:207-227` | Item error messages: distinguishes not found / deleted / zero-stock             |
| `src/modules/order/services/order.service.ts:230-247` | Stock validation: `quantity > 0`, `quantity <= stock`                           |
| `src/modules/order/services/order.service.ts:428-445` | Atomic `updateMany` decrement with `stock: { gte: quantity }` concurrency guard |
| `src/modules/order/services/order.service.ts:542-544` | Call `restoreStockForOrder(tx, id)` on CANCELLED                                |
| `src/modules/order/services/order.service.ts:613-628` | New `restoreStockForOrder(tx, orderId)` method                                  |

### Concurrency Guard

`updateMany({ where: { id, stock: { gte: quantity } } })` ensures:

- Only one concurrent request can decrement stock for the same item
- If stock changed between read and write, `count === 0` → transaction rolls back
- No partial stock decrements

### Stock Restore on Cancel

- `restoreStockForOrder(tx, orderId)` reads `OrderItem` records and increments `SupplierItem.stock`
- Called inside `$transaction` for all cancel paths: PENDING/CONFIRMED/DELIVERED/COMPLETED → CANCELLED
- Uses `tx` client (same transaction as order status update)
- `stockUpdatedAt` updated on every decrement/restore

### Behavior After

- Soft-deleted items (`deletedAt != null`) cannot be ordered
- Zero-stock items (`stock = 0`) cannot be ordered
- Orders exceeding available stock are rejected
- Concurrent orders for same item: atomic guard prevents over-reservation
- Cancellation restores stock atomically
- No changes to database schema, events, InventoryStock, DTOs, or controller routes

---

## P7: Transaction History Endpoints

**Date**: 2026-09-04

### New Endpoints

```
GET /api/orders/transactions
Authorization: Bearer <token>
Query: page, limit, startDate?, endDate?, status?

GET /api/orders/transactions/:id
Authorization: Bearer <token>
```

### GET /orders/transactions

| Aspect                 | Detail                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Guard**              | `JwtAuthGuard` + `RolesGuard`                                                                                                  |
| **Roles**              | `SPPG_ADMIN` only                                                                                                              |
| **SPPG scoping**       | Automatic from JWT (`user.sppgId`)                                                                                             |
| **Default date range** | Today (UTC)                                                                                                                    |
| **Date filter field**  | `createdAt`                                                                                                                    |
| **Date range pattern** | Half-open: `{ gte: start, lt: exclusiveEnd }`                                                                                  |
| **Timezone handling**  | `parseDateOnly("YYYY-MM-DD")` → `new Date("YYYY-MM-DDT00:00:00.000Z")` — consistent UTC midnight regardless of server timezone |
| **Sort**               | `createdAt desc`                                                                                                               |
| **Status filter**      | Optional, matches exact `OrderStatus` enum                                                                                     |

**Response:**

```json
{
  "items": [
    {
      "id": "clx...",
      "createdAt": "2026-07-09T08:30:00.000Z",
      "status": "COMPLETED",
      "total": 615000,
      "supplier": { "id": "clx...", "name": "UD. Sumber Rejeki" },
      "itemCount": 3,
      "paidAt": "2026-07-09T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

### GET /orders/transactions/:id

| Aspect           | Detail                                                                              |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Guard**        | `JwtAuthGuard` + `RolesGuard`                                                       |
| **Roles**        | `SPPG_ADMIN` only                                                                   |
| **SPPG scoping** | `findFirst({ where: { id, sppgId } })` — rejects if order belongs to different SPPG |
| **Data**         | Uses OrderItem snapshot data (prices, quantities as recorded at order time)         |

**Response:**

```json
{
  "id": "clx...",
  "status": "COMPLETED",
  "total": 615000,
  "notes": "Pesanan bahan baku minggu ini",
  "createdAt": "2026-07-09T08:30:00.000Z",
  "updatedAt": "2026-07-09T10:00:00.000Z",
  "paidAt": "2026-07-09T10:00:00.000Z",
  "cancelledAt": null,
  "cancelledReason": null,
  "expectedDeliveryDate": "2026-07-11T00:00:00.000Z",
  "actualDeliveryDate": "2026-07-10T14:00:00.000Z",
  "supplier": {
    "id": "clx...",
    "name": "UD. Sumber Rejeki",
    "phone": "08123456789",
    "address": "Jl. Raya Purwakarta No. 1",
    "profileImage": "/uploads/profiles/xxx.jpg"
  },
  "sppg": { "id": "clx...", "name": "SPPG Purwakarta" },
  "items": [
    {
      "id": "clx...",
      "item": { "id": "clx...", "name": "Beras Premium", "unit": "kg" },
      "quantity": 20,
      "unitPrice": 11500,
      "subtotal": 230000,
      "marketMedianAtPurchase": 12000,
      "isWarningBypass": false,
      "justificationNote": "Semua harga valid sesuai data pasar"
    }
  ],
  "statusHistory": [
    {
      "id": "clx...",
      "fromStatus": null,
      "toStatus": "PENDING",
      "notes": "...",
      "createdAt": "..."
    },
    {
      "id": "clx...",
      "fromStatus": "PENDING",
      "toStatus": "CONFIRMED",
      "notes": null,
      "createdAt": "..."
    }
  ]
}
```

### Files

| File                                                     | Change                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/modules/order/dto/transaction-history-query.dto.ts` | **NEW** — Query DTO extending `PaginationDto` with `startDate`, `endDate`, `status` |
| `src/modules/order/dto/index.ts`                         | Added `TransactionHistoryQueryDto` export                                           |
| `src/modules/order/services/order.service.ts`            | Added `findTransactions()`, `findTransactionDetail()`, `parseDateOnly()`            |
| `src/modules/order/controllers/order.controller.ts`      | Added `GET /orders/transactions` and `GET /orders/transactions/:id`                 |

### Constraints

- Direct Prisma queries (no repository layer, matching existing Order module pattern)
- No schema migration, no shared package changes
- No changes to existing Order API behavior
- `parseDateOnly` follows same pattern as Reports module (`YYYY-MM-DDT00:00:00.000Z`)

---

## Known MVP Limitations

1. No file deletion/garbage collection for orphaned uploads
2. No image resizing or optimization
3. Files stored on local disk only (not S3/CDN)
4. No virus/malware scanning
5. Fetch-all in-memory pagination (not DB-level cursors)
6. Tests not written (`@types/jest` and `@nestjs/testing` not installed)

---

## Migration

The `init_clean` migration replaces all 15 previous migrations with a single DDL script.

```bash
cd apps/backend
npx prisma migrate deploy   # apply migration
npx prisma db seed          # seed data (optional)
npx prisma generate         # regenerate client
```

---

## Seed Data

- SPPG: 3
- Users: 3 admin + 18 supplier + 60 market sellers
- Suppliers: 78 total
- SupplierItems: ~250+ items
- Beneficiaries, MoU, Orders, Batches, Complaints, Inventory, OpEx: schema intact, no seed data
