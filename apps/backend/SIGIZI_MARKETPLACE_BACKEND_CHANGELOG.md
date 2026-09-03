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
