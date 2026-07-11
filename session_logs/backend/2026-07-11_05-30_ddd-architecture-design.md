# Session Log - @backend - 2026-07-11

## Current Task

Backend Architecture Redesign: DDD + Clean Architecture

## Progress

- [x] Schema redesign: NIB + Structured Addresses + MoU Partnership
- [x] Analyzed existing backend codebase (38 files, ~1,580 lines)
- [x] Designed DDD + Clean Architecture structure
- [x] Analyzed coupling between modules
- [x] Identified business rules per module
- [x] Designed entity classes with business methods
- [x] Added Value Objects, Aggregates, Domain Errors
- [x] Final audit against DDD/Clean Architecture principles
- [ ] DELETE all existing module files
- [ ] CREATE core/ module (value objects, errors, base entity)
- [ ] CREATE auth/ module
- [ ] CREATE sppg/ module
- [ ] CREATE supplier/ module
- [ ] CREATE beneficiary/ module
- [ ] CREATE mou/ module
- [ ] CREATE order/ module
- [ ] CREATE batch/ module
- [ ] CREATE complaint/ module
- [ ] CREATE market/ module
- [ ] CREATE reports/ module
- [ ] UPDATE app.module.ts
- [ ] Test compilation

## Files Modified (Previous Session)

- `apps/backend/prisma/schema.prisma` — 12 models, 5 enums, 34 CHECK constraints
- `apps/backend/prisma/seed.ts` — NIB + GPS + MoU seed data
- `apps/backend/package.json` — +3 db scripts
- `package.json` (root) — +3 db scripts
- `packages/shared/src/types/index.ts` — +Mou/MouItem/MouStatus
- `packages/shared/src/constants/index.ts` — removed NPWP, +NIB/MoU/GPS
- `apps/backend/prisma/migrations/20260710180000_add_nib_addresses_mou/migration.sql`

## Architecture Decisions (THIS SESSION)

### 1. DDD Lite Approach (MVP-friendly)

- Entities as CLASSES with business methods (not interfaces)
- Aggregates with roots that manage children
- Value Objects for complex concepts (Address, GPS, Money, DateRange)
- Domain Services for cross-aggregate logic
- Domain Errors for business rule violations
- Repositories per Aggregate Root

### 2. Module Structure Pattern

```
modules/<feature>/
├── <feature>.module.ts
├── controllers/<feature>.controller.ts
├── services/<feature>.service.ts
├── repositories/<feature>.repository.ts
├── dto/*.dto.ts
└── entities/*.entity.ts
```

### 3. 10 Modules to Build

| Module       | Type           | Entity Type                        | Business Rules                      |
| ------------ | -------------- | ---------------------------------- | ----------------------------------- |
| core/        | Infrastructure | Value Objects, Errors, Base Entity | —                                   |
| auth/        | Infrastructure | —                                  | Mock SSO + JWT                      |
| sppg/        | Feature        | Interface (simple CRUD)            | —                                   |
| supplier/    | Feature        | Class (Aggregate Root)             | NIB validation                      |
| beneficiary/ | Feature        | Interface (simple CRUD)            | —                                   |
| mou/         | Feature        | Class (Aggregate Root)             | Status transitions, date validation |
| order/       | Feature        | Class (Aggregate Root)             | Status transitions, MoU pricing     |
| batch/       | Feature        | Class (Aggregate Root)             | Cost computation, reportKey         |
| complaint/   | Feature        | Class                              | ReportKey validation                |
| market/      | Domain Service | —                                  | IQR anomaly detection               |
| reports/     | Domain Service | —                                  | Daily/weekly aggregation            |

### 4. Value Objects to Create

| VO            | Fields                                             | Methods                           |
| ------------- | -------------------------------------------------- | --------------------------------- |
| Address       | province, regency, district, village?, postalCode? | toString()                        |
| GpsCoordinate | latitude, longitude                                | distanceTo() (Haversine)          |
| Money         | amount, currency                                   | add(), subtract(), equals()       |
| DateRange     | startDate, endDate                                 | contains(), duration(), isValid() |

### 5. Aggregates

| Root     | Children      | Invariant                  |
| -------- | ------------- | -------------------------- |
| Order    | OrderItems    | total = SUM(subtotal)      |
| Batch    | BatchItems    | totalCost = SUM(subtotal)  |
| Mou      | MouItems      | one item per supplier item |
| Supplier | SupplierItems | —                          |

### 6. Domain Errors

| Error                        | When                             |
| ---------------------------- | -------------------------------- |
| InvalidStatusTransitionError | Entity status cannot transition  |
| InvariantViolationError      | Business rule violated           |
| EntityNotFoundError          | Record not found                 |
| DomainError                  | Base class for all domain errors |

### 7. Loose Coupling Rules

- Modules do NOT import each other's services
- Repositories query Prisma directly for related data
- Cross-module types via @sigizi/shared
- Entities import from @sigizi/shared, NOT @prisma/client

### 8. Clean Architecture Layers

```
Controllers → Services → Repositories → Prisma
    ↓           ↓           ↓
  DTOs      Entities    Value Objects
    ↓           ↓           ↓
  @sigizi/shared (pure types)
```

## Files to DELETE (15 files)

```
src/modules/auth/*         (5 files)
src/modules/supplier/*     (3 files)
src/modules/batch/*        (3 files)
src/modules/complaint/*    (3 files)
src/modules/market/*       (3 files)
src/modules/reports/*      (3 files)
```

## Files to CREATE (~60 files)

```
src/core/                     (10 files)
src/modules/auth/             (6 files)
src/modules/sppg/             (6 files)
src/modules/supplier/         (7 files)
src/modules/beneficiary/      (6 files)
src/modules/mou/              (7 files)
src/modules/order/            (7 files)
src/modules/batch/            (7 files)
src/modules/complaint/        (6 files)
src/modules/market/           (4 files)
src/modules/reports/          (4 files)
src/app.module.ts             (1 update)
```

## Decisions Made

1. **npwp → nib**: NIB stores file URL/path ke scan dokumen
2. **Flat address fields**: For MVP simplicity, but conceptually Value Objects
3. **GPS for proximity**: Haversine distance calculation
4. **MoU design**: Mou + MouItem with status flow
5. **DDD Lite**: Entities as classes, Aggregates simplified, Value Objects as interfaces for MVP
6. **Loose coupling**: No cross-module service imports, repositories use Prisma directly
7. **Prisma isolation**: Entities use @sigizi/shared, NOT @prisma/client

## Blockers

- Docker/PostgreSQL not available in WSL — cannot test `pnpm db:fresh`
- Context window almost full — need to continue in new session

## Next Steps

1. Save this session log
2. Commit current changes
3. Continue implementation in new session:
   - Delete existing module files
   - Create core/ module
   - Create all 10 feature modules
   - Update app.module.ts
   - Test compilation

## Checkpoint

- Context usage: ~95%
- Last tool call: write session log
- Timestamp: 2026-07-11T05:30:00+07:00
- Git commit: c82c12c (previous session)
