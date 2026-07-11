# Session Log - @backend - 2026-07-10

## Current Task

Schema redesign: NIB + Structured Addresses + MoU Partnership

## Progress

- [x] Rewrite schema.prisma (12 models, 5 enums)
- [x] Add Supplier.nib (replaces npwp)
- [x] Add structured address fields (province/regency/district/village/postalCode/lat/lng) to Supplier & Sppg
- [x] Add MoU model + MouItem model (kontrak kerjasama)
- [x] Add optional mouId to Order (link order ke MoU)
- [x] Add 34 CHECK constraints (GPS range, address not empty, MoU date logic, price/quantity positive, etc.)
- [x] Update shared types (Supplier, Sppg, Mou, MouItem, MouStatus)
- [x] Update shared constants (removed NPWP, added NIB/MoU/GPS constants)
- [x] Update seed.ts with NIB + GPS + MoU seed data
- [x] Create fresh migration SQL (20260710180000_add_nib_addresses_mou)
- [x] Regenerate Prisma client

## Files Modified

- `apps/backend/prisma/schema.prisma` — 12 models, 5 enums, 34 CHECK constraints
- `apps/backend/prisma/seed.ts` — NIB + GPS + MoU seed data
- `apps/backend/package.json` — +3 scripts (prisma:reset, prisma:fresh, prisma:reseed)
- `package.json` (root) — +3 scripts (db:reset, db:fresh, db:reseed)
- `packages/shared/src/types/index.ts` — +Mou/MouItem/MouStatus, Supplier.nib
- `packages/shared/src/constants/index.ts` — removed NPWP, +NIB/MoU/GPS constants
- `apps/backend/prisma/migrations/20260710180000_add_nib_addresses_mou/migration.sql`

## Decisions Made

1. **npwp → nib**: NIB (Nomor Induk Berusaha) stores file URL/path ke scan dokumen
2. **Flat address fields**: province/regency/district/village/postalCode as string fields (MVP simplicity)
3. **GPS for proximity**: latitude/longitude enables Haversine distance calculation for nearby supplier filtering
4. **MoU design**: Mou + MouItem models with status flow DRAFT → ACTIVE → EXPIRED/TERMINATED
5. **Optional mouId on Order**: Orders can optionally link to MoU for special pricing
6. **idempotent seed**: All seed operations use upsert for re-runnability

## Blockers

- Docker/PostgreSQL not available in WSL — cannot run `pnpm db:fresh` to test

## Next Steps

1. Run `pnpm db:fresh` when PostgreSQL is available
2. Test MoU workflow (create MoU → create order linked to MoU → auto pricing from MouItem)
3. Implement proximity-based supplier filtering in backend service layer
4. Implement Geolocation API integration in frontend for GPS auto-fill

## Checkpoint

- Context usage: ~40%
- Last tool call: git commit
- Timestamp: 2026-07-10T18:30:00+07:00

## Git

- Commit: c82c12c [backend] redesign schema: NIB + structured addresses + MoU partnership
- Branch: master
- Status: Clean, ready for push
