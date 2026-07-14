# Issue: [backend] Fix 16 TypeScript errors preventing compilation

**Labels:** backend, bug, critical

---

## Backend Compilation Error: 16 TypeScript Errors Prevent Server Startup

Backend tidak bisa compile karena **16 error TypeScript**. Server tidak start → semua frontend API call gagal ("Failed to fetch").

---

### Error Summary

| # | File | Error | Root Cause |
|---|------|-------|------------|
| 1 | `inventory-event.handler.ts:12` | Cannot find name `StockSource` | Enum tidak di-export dari `@sigizi/shared` |
| 2 | `inventory.service.ts:11` | Cannot find name `StockSource` | Sama |
| 3-14 | `order.controller.ts:16`, `reports.controller.ts:14`, `operational-expense.controller.ts:14` (12 error) | Module `"../../../common"` has no exported member `JwtAuthGuard`, `RolesGuard`, `Roles`, `CurrentUser` | Guards/decorators exist tapi tidak barrel-exported |
| 15 | `order/dto/index.ts:3` | `UpdateOrderStatusDto` not exported from `create-order.dto` | DTO belum dibuat |
| 16 | `order.controller.ts:33,63` | Argument count mismatch (controller vs service) | Service method signatures belum lengkap |
| 17 | `order.service.ts:141` | `createdById` missing in InventoryStock create | Prisma required field |

---

### Error Group 1: `StockSource` not in shared (2 errors)

**Files:** `apps/backend/src/modules/inventory/inventory-event.handler.ts:12`, `apps/backend/src/modules/inventory/inventory.service.ts:11`

```ts
import { StockSource, Role } from "@sigizi/shared";
// ❌ StockSource does not exist in shared package
```

**Root cause:** Prisma schema defines `enum StockSource { SYSTEM_ORDER, MANUAL_ADJUSTMENT, BATCH_RETURN }` in `schema.prisma:47`, but `packages/shared/src/index.ts` does not export it.

**Fix:** Add `StockSource` to `packages/shared/src/index.ts`:
```ts
export enum StockSource {
  SYSTEM_ORDER = "SYSTEM_ORDER",
  MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT",
  BATCH_RETURN = "BATCH_RETURN",
}
```

---

### Error Group 2: Guards/decorators not exported from common (12 errors across 3 files)

**Files:**
- `apps/backend/src/modules/order/controllers/order.controller.ts:16`
- `apps/backend/src/modules/reports/controllers/reports.controller.ts:14`
- `apps/backend/src/modules/reports/controllers/operational-expense.controller.ts:14`

All import:
```ts
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";
// ❌ Module has no exported member
```

**Root cause:** The files exist but `common/index.ts` only exports logger, middleware, filters, interceptors, exceptions. Guards and decorators are NOT barrel-exported.

**Note:** `inventory.controller.ts` works because it imports directly from path:
```ts
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"; // ✅ works
```

**Fix:** Add to `apps/backend/src/common/index.ts`:
```ts
// Guards
export { JwtAuthGuard } from "./guards/jwt-auth.guard";
export { RolesGuard } from "./guards/roles.guard";

// Decorators
export { Roles } from "./decorators/roles.decorator";
export { CurrentUser } from "./decorators/current-user.decorator";
```

---

### Error Group 3: `UpdateOrderStatusDto` missing (1 error)

**File:** `apps/backend/src/modules/order/dto/index.ts:3`

```ts
export { CreateOrderDto, UpdateOrderStatusDto, OrderItemRequestDto } from "./create-order.dto";
// ❌ UpdateOrderStatusDto does not exist
```

**Fix:** Add to `apps/backend/src/modules/order/dto/create-order.dto.ts`:
```ts
import { IsEnum, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@sigizi/shared";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

### Error Group 4: Controller/service argument mismatch (2 errors)

**File:** `apps/backend/src/modules/order/controllers/order.controller.ts`

**Error line 33 — `findAll`:**
```ts
// Controller calls with 4 args:
this.orderService.findAll(pagination, sppgId, supplierId, status);
// Service accepts only 3:
async findAll(pagination: PaginationDto, sppgId?: string, supplierId?: string)
```

**Error line 63 — `updateStatus`:**
```ts
// Controller calls with 3 args:
this.orderService.updateStatus(id, dto, user);
// Service accepts only 2 with wrong type:
async updateStatus(id: string, newStatus: OrderStatus)
```

**Fix:** Update `apps/backend/src/modules/order/services/order.service.ts`:
```ts
// findAll — add status param
async findAll(pagination: PaginationDto, sppgId?: string, supplierId?: string, status?: OrderStatus) {

// updateStatus — accept DTO + user object
async updateStatus(id: string, dto: UpdateOrderStatusDto, user: { id: string }) {
```

---

### Error Group 5: `createdById` missing in InventoryStock create (1 error)

**File:** `apps/backend/src/modules/order/services/order.service.ts:141`

```ts
await tx.inventoryStock.create({
  data: {
    sppgId: order.sppgId,
    itemId: orderItem.itemId,
    orderItemId: orderItem.id,
    purchasePrice: orderItem.unitPrice,
    initialQty: orderItem.quantity,
    remainingQty: orderItem.quantity,
    // ❌ createdById is required by Prisma schema
  },
});
```

**Fix:** Add `createdById: user.id` to the create call (requires Error Group 4 fix first).

---

### Fix Checklist

- [ ] Add `StockSource` enum to `packages/shared/src/index.ts`
- [ ] Add guard/decorator exports to `apps/backend/src/common/index.ts`
- [ ] Create `UpdateOrderStatusDto` in `apps/backend/src/modules/order/dto/create-order.dto.ts`
- [ ] Update `order.service.ts` — `findAll` add `status` param
- [ ] Update `order.service.ts` — `updateStatus` accept `(id, dto, user)`
- [ ] Add `createdById: user.id` to InventoryStock create in `order.service.ts`

### Verification

After fixing all errors:
```bash
cd apps/backend
pnpm build  # Should compile with 0 errors
pnpm dev    # Server should start on port 3001
```

---

**Impact:** Backend cannot compile → all frontend API calls fail with "Failed to fetch" → login, batch, beneficiary, market, order, inventory pages all non-functional.
