# SIGIZI Marketplace Backend - Changelog

**Last Updated**: 2026-09-03
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
