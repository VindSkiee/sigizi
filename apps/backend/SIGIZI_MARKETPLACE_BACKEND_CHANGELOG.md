# SIGIZI Marketplace Backend - Changelog

**Date**: 2026-09-03
**Scope**: Backend only (`apps/backend/`)

---

## Summary

Added new fields to Supplier and SupplierItem models, cleaned up Prisma migrations (replaced 15 old migrations with one `init_clean`), refactored seeder to only keep SPPG/Supplier/Items/Users/Market data, and prepared backend for marketplace-focused implementation.

---

## Schema Changes

### Supplier Model

| Field          | Type      | Default | Description                           |
| -------------- | --------- | ------- | ------------------------------------- |
| `profileImage` | `String?` | null    | Supplier profile image URL            |
| `openStatus`   | `Boolean` | `true`  | Whether supplier is open for business |

### SupplierItem Model

| Field            | Type        | Default | Description                 |
| ---------------- | ----------- | ------- | --------------------------- |
| `image`          | `String?`   | null    | Item image URL              |
| `stock`          | `Float`     | `0`     | Current stock quantity      |
| `priceUpdatedAt` | `DateTime?` | null    | Last price change timestamp |
| `stockUpdatedAt` | `DateTime?` | null    | Last stock change timestamp |

---

## Files Modified

| File                                                                  | Change                                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `prisma/schema.prisma`                                                | Added 6 new fields across Supplier + SupplierItem                                                                                          |
| `prisma/migrations/20260903000000_init_clean/migration.sql`           | **NEW** - Complete DDL migration                                                                                                           |
| `prisma/seed.ts`                                                      | Removed sections 5-13 (Beneficiaries, MoU, Orders, Batches, Complaints, Inventory, OpEx)                                                   |
| `src/modules/supplier/domain/entities/supplier.entity.ts`             | Added `profileImage`, `openStatus` to constructor + `updateProfile()`                                                                      |
| `src/modules/supplier/domain/repositories/supplier.repository.ts`     | Updated all interfaces: `CreateSupplierData`, `UpdateSupplierData`, `SupplierItemData`, `CreateSupplierItemData`, `UpdateSupplierItemData` |
| `src/modules/supplier/application/dto/create-supplier.dto.ts`         | Added `profileImage`, `openStatus`                                                                                                         |
| `src/modules/supplier/application/dto/update-supplier-profile.dto.ts` | Added `profileImage`, `openStatus`                                                                                                         |
| `src/modules/supplier/application/dto/create-supplier-item.dto.ts`    | Added `image`, `stock` with `@Min(0)`                                                                                                      |
| `src/modules/supplier/application/dto/update-supplier-item.dto.ts`    | Added `image`, `stock` with `@Min(0)`                                                                                                      |
| `src/modules/supplier/application/services/supplier.service.ts`       | Timestamp refresh logic in `addItem()` and `updateItem()`                                                                                  |
| `src/modules/supplier/infrastructure/prisma/supplier.repository.ts`   | Updated all Prisma mappings for new fields                                                                                                 |

---

## Key Design Decisions

### Timestamp Refresh Logic

- **`addItem()`**: Both `priceUpdatedAt` and `stockUpdatedAt` set to a single `const now = new Date()`
- **`updateItem()`**: Uses `"basePrice" in dto` / `"stock" in dto` checks (presence-based, NOT value comparison)
  - If field is **present** in dto → refresh timestamp, even if value is identical
  - If field is **absent** → no timestamp refresh
- Fields `updatedAt`, `priceUpdatedAt`, `stockUpdatedAt` are **NOT exposed in DTOs** (server-managed only)

### Validation

- `basePrice >= 0` via `@Min(0)` decorator
- `stock >= 0` via `@Min(0)` decorator
- No unnecessary abstractions

### Seeder Cleanup

- Removed seed sections 5-13 (Beneficiaries through OperationalExpenses)
- Kept: SPPG (3), Users (3 admin + 18 supplier + 60 market sellers), Suppliers (78 total), SupplierItems (~250+ items)
- Prisma schema/domain for Orders, Batches, etc. remains intact — just no seed data

---

## Migration

The `init_clean` migration replaces all 15 previous migrations with a single DDL script. This is appropriate for a pre-production/hackathon project.

```bash
# Apply migration (when database is available)
cd apps/backend
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

---

## Known Issues

1. **LSP errors on `supplier.repository.ts`**: The LSP reports errors on new schema fields (`profileImage`, `image`, `stock`, `priceUpdatedAt`, `stockUpdatedAt`). These are false positives — the Prisma client needs regeneration after the migration is applied. Run `npx prisma generate` to resolve.

2. **Tests not written**: `@types/jest` and `@nestjs/testing` are not in `package.json`. Tests should be added when testing dependencies are installed.

---

## Testing Checklist

When database is available:

- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npx prisma db seed`
- [ ] Verify Supplier CRUD with new fields (`profileImage`, `openStatus`)
- [ ] Verify SupplierItem CRUD with new fields (`image`, `stock`, `priceUpdatedAt`, `stockUpdatedAt`)
- [ ] Verify timestamp refresh on `addItem()` (both timestamps set)
- [ ] Verify timestamp refresh on `updateItem()` with `basePrice` change
- [ ] Verify timestamp refresh on `updateItem()` with `stock` change
- [ ] Verify NO timestamp refresh when only `name` or `description` changes
- [ ] Verify validation: `basePrice < 0` rejected, `stock < 0` rejected

---

## Market API Improvements

**Date**: 2026-09-03

### New Files

| File                                                      | Description                                 |
| --------------------------------------------------------- | ------------------------------------------- |
| `src/modules/market/dto/market-paginated-response.dto.ts` | Generic `{ data, meta }` pagination wrapper |

### Modified Files

| File                                                   | Change                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `src/modules/market/dto/market-location-filter.dto.ts` | Added `page` and `limit` fields to `MarketLocationFilterDto` |
| `src/modules/market/services/market.service.ts`        | Sorting, pagination, stock/freshness fields                  |
| `src/modules/market/controllers/market.controller.ts`  | Pagination params for regions/markets                        |

### Sorting

- **Non-GPS mode**: `stock desc`, `priceUpdatedAt desc`, `stockUpdatedAt desc`, `id asc`
- **GPS mode**: `distanceKm asc` (primary), then stock/freshness/id as secondary
- Added `sortSupplierItems()` private method

### Pagination

All collection endpoints now return `{ data, meta }` where:

```typescript
{
  data: T,
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

- `GET /market/prices` — paginated suppliers array within data
- `GET /market/regions` — paginated provinces array
- `GET /market/markets` — paginated markets array
- `GET /market/anomalies` — paginated anomalies array
- `GET /market/het-suggestion` — paginated (via getMarketPricesRaw)
- `POST /market/validate-price` — unchanged (no pagination)

**Default**: `page=1, limit=20`. Max `limit=100`.

**Fetch-all in-memory pagination**: Entire scope set is fetched, sorted, then sliced. Acceptable for MVP. Future optimization: database-level pagination with WHERE cursors.

**HET/anomaly calculations**: Always use full resolved dataset BEFORE pagination.

### New SupplierItem Fields in Response

Each supplier in `GET /market/prices` now includes:

| Field            | Type             | Description                                                            |
| ---------------- | ---------------- | ---------------------------------------------------------------------- |
| `stock`          | `number`         | Current stock quantity                                                 |
| `priceUpdatedAt` | `string \| null` | ISO timestamp of last price change                                     |
| `stockUpdatedAt` | `string \| null` | ISO timestamp of last stock change                                     |
| `openStatus`     | `boolean`        | Whether supplier is open for business (`true` = buka, `false` = tutup) |

### Internal Callers

- `getMarketPricesRaw()` — unpaginated, used by `getHETSuggestion()` and `getMarketContextForItem()`
- `getMarketPrices()` — paginated, used by controller
- `validatePrice()` — unchanged, calls `getMarketPricesRaw()` via `getMarketContextForItem()`

---

## Item Detail API

**Date**: 2026-09-03

### New Endpoint

```
GET /market/items/:id
Authorization: Bearer <token>
```

Returns a single item with its full supplier profile. Requires JWT authentication.

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
    "image": "https://...",
    "stock": 150,
    "priceUpdatedAt": "2026-09-03T00:00:00.000Z",
    "stockUpdatedAt": "2026-09-03T00:00:00.000Z",
    "createdAt": "2026-07-09T00:00:00.000Z"
  },
  "supplier": {
    "id": "clx...",
    "name": "UD. Sumber Rejeki",
    "phone": "08123456789",
    "profileImage": "/uploads/profiles/1693420800000-abc123.jpg",
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
- Uses direct Prisma query with `include: { supplier: true }` (no cross-module dependency)

### Files Modified

| File                                                  | Change                                           |
| ----------------------------------------------------- | ------------------------------------------------ |
| `src/modules/market/services/market.service.ts`       | Added `getItemDetail(id)` method                 |
| `src/modules/market/controllers/market.controller.ts` | Added `GET /items/:id` route with `JwtAuthGuard` |

### Client Reorganization Suggestion

Move the **"Buat Pesanan" (Create Order)** flow to the new item detail page (`/market/items/:id`):

- Current: Order creation likely lives in a separate order management page
- Suggested: On the item detail page, show full item info + supplier profile, then a "Pesan Sekarang" button that opens the order form with the item pre-selected
- This gives users full context (item specs, supplier location, stock, open status) before placing an order

---

## File Upload

**Date**: 2026-09-03

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

| Rule          | Value                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| Allowed types | `image/jpeg`, `image/png`, `image/webp`                                                 |
| Max size      | 5MB                                                                                     |
| Auth          | Required (any logged-in user)                                                           |
| Storage       | `apps/backend/uploads/items/` and `apps/backend/uploads/profiles/`                      |
| Filename      | `${Date.now()}-${randomBytes(8).hex}${ext}` (server-controlled, no trust original name) |

### Static File Serving

Files are served at `/uploads/...` via `app.useStaticAssets()` in `main.ts`.

Example: `http://localhost:3001/uploads/items/1693420800000-abc123.jpg`

Note: No `/api` prefix — the global prefix does not apply to static assets.

### Upload-Enabled Endpoints

| Endpoint                                 | File field | Storage dir         | Merges into        |
| ---------------------------------------- | ---------- | ------------------- | ------------------ |
| `POST /api/upload/image`                 | `file`     | `uploads/items/`    | N/A (returns URL)  |
| `POST /api/upload/profile`               | `file`     | `uploads/profiles/` | N/A (returns URL)  |
| `POST /api/suppliers/:id/items`          | `file`     | `uploads/items/`    | `dto.image`        |
| `PATCH /api/suppliers/:id/items/:itemId` | `file`     | `uploads/items/`    | `dto.image`        |
| `PUT /api/suppliers/me/profile`          | `file`     | `uploads/profiles/` | `dto.profileImage` |

### Client Workflow

1. Upload image: `POST /api/upload/image` → get `{ url: "/uploads/items/xxx.jpg" }`
2. Create/update item with `image: "/uploads/items/xxx.jpg"` in JSON body
3. Upload profile: `POST /api/upload/profile` → get `{ url: "/uploads/profiles/xxx.jpg" }`
4. Update profile with `profileImage: "/uploads/profiles/xxx.jpg"` in JSON body
5. Render images: `${API_BASE_URL}/uploads/items/xxx.jpg`

### Files Created/Modified

| File                                                            | Change                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/types/multer.d.ts`                                         | **NEW** — Local Express.Multer type declaration                 |
| `src/common/upload/upload.module.ts`                            | **NEW** — Upload module                                         |
| `src/common/upload/upload.controller.ts`                        | **NEW** — `POST /upload/image` and `POST /upload/profile`       |
| `src/main.ts`                                                   | Added `useStaticAssets` for `/uploads`                          |
| `src/app.module.ts`                                             | Registered `UploadModule`                                       |
| `src/modules/market/services/market.service.ts`                 | Added `profileImage` to `getItemDetail()` supplier response     |
| `src/modules/supplier/presentation/http/supplier.controller.ts` | Added `FileInterceptor` to POST items, PATCH items, PUT profile |
| `.gitignore`                                                    | Added `uploads/`                                                |

### Known MVP Limitations

- No file deletion/garbage collection for orphaned uploads
- No image resizing or optimization
- Files stored on local disk only (not S3/CDN)
- No virus/malware scanning
