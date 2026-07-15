# Session Log - Frontend - 2026-07-15

## Current Task

Supplier MVP Dashboard & Katalog Fixes

## Progress

- [x] Add logo to SupplierSidebar.tsx
- [x] Redesign supplier/page.tsx - remove charts, add 2 summary cards
- [x] Move stats cards from pesanan/page.tsx to supplier/page.tsx
- [x] Add logo to SupplierLayout.tsx, remove username
- [x] Fix logo centering in SupplierSidebar
- [x] Add object-contain to Image logo
- [x] Change logo from SVG to PNG format
- [x] Fix soft-delete for supplier items (deletedAt field)
- [x] Fix ConfirmModal overlay not covering full screen (createPortal)
- [x] Hide MoU card in development mode
- [x] Welcome header section with real-time badge
- [x] Hybrid data display: global stats + today's orders only

## Files Modified

- `apps/portal/src/components/layout/SupplierSidebar.tsx` - Logo PNG with center alignment
- `apps/portal/src/components/layout/SupplierLayout.tsx` - Logo PNG, remove username
- `apps/portal/src/components/ui/ConfirmModal.tsx` - createPortal + z-[9999]
- `apps/portal/src/components/features/auth/Logo.tsx` - Change logo.svg to logo.png
- `apps/portal/src/app/supplier/page.tsx` - Complete dashboard redesign
- `apps/portal/src/app/supplier/pesanan/page.tsx` - Remove stats cards
- `apps/portal/src/app/supplier/katalog/page.tsx` - Filter deletedAt items, update delete message
- `apps/backend/prisma/schema.prisma` - Add deletedAt field to SupplierItem
- `apps/backend/prisma/migrations/20260715_add_supplier_item_deleted_at/migration.sql`
- `apps/backend/src/modules/supplier/domain/repositories/supplier.repository.ts` - deletedAt in SupplierItemData
- `apps/backend/src/modules/supplier/infrastructure/prisma/supplier.repository.ts` - Filter deletedAt + mappings
- `apps/backend/src/modules/supplier/application/services/supplier.service.ts` - Soft delete logic

## Decisions Made

- Logo: Changed from SVG (embedded PNG) to pure PNG for proper resizing
- Soft delete: Use deletedAt field instead of isAvailable to distinguish manual deactivation vs reference-based deletion
- Dashboard: Hybrid approach - global stats + today's orders only
- Development mode: Hide MoU card with NODE_ENV check

## Next Steps

1. Run `pnpm prisma migrate deploy` when database available
2. Test supplier dashboard with real data
3. Test soft-delete flow end-to-end

## Checkpoint

- Context usage: ~60%
- Timestamp: 2026-07-15
