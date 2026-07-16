# prisma-conventions

## Tujuan

Konsistensi naming, struktur, dan best practices untuk Prisma schema dan migrations.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  PRISMA CONVENTIONS                                         │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan snake_case untuk nama tabel di DB               │
│  2. Gunakan camelCase untuk nama field di Prisma schema     │
│  3. Gunakan @map untuk mapping nama tabel                   │
│  4. Gunakan @id @default(cuid()) untuk primary key          │
│  5. Gunakan @default(now()) untuk created timestamp         │
│  6. Gunakan @updatedAt untuk updated timestamp              │
│  7. Selalu create migration sebelum apply                   │
│  8. Review migration SQL sebelum apply                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Naming Convention

| Item | Convention | Contoh |
|------|------------|--------|
| Table | snake_case (plural) | `supplier_items` |
| Column | snake_case | `created_at`, `base_price` |
| Index | `idx_{table}_{column}` | `idx_supplier_items_supplier_id` |
| Foreign Key | `{table}_{column}_fkey` | `supplier_items_supplier_id_fkey` |
| Primary Key | `id` | `id` |
| Migration | `{timestamp}_{name}` | `20260709_add_supplier_table` |

---

## Template

### Basic Model

```prisma
model Supplier {
  id        String   @id @default(cuid())
  name      String
  npwp      String   @unique
  phone     String?
  address   String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  items     SupplierItem[]
  orders    Order[]

  @@map("suppliers")
}
```

### Model with Relations

```prisma
model SupplierItem {
  id         String   @id @default(cuid())
  name       String
  unit       String
  basePrice  Float    @map("base_price")
  supplierId String   @map("supplier_id")
  
  // Relations
  supplier   Supplier @relation(fields: [supplierId], references: [id])
  
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([supplierId])
  @@map("supplier_items")
}
```

### Model with Soft Delete

```prisma
model Supplier {
  id        String    @id @default(cuid())
  name      String
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("suppliers")
}
```

### Model with Indexes

```prisma
model Batch {
  id          String   @id @default(cuid())
  batchNumber String   @unique @map("batch_number")
  date        DateTime @default(now())
  sppgId      String   @map("sppg_id")
  status      String   @default("ACTIVE")

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([sppgId])
  @@index([date])
  @@index([batchNumber])
  @@index([status])
  @@map("batches")
}
```

---

## Relations

### One-to-Many

```prisma
model Sppg {
  id            String        @id @default(cuid())
  name          String
  beneficiaries Beneficiary[]
  batches       Batch[]
}

model Beneficiary {
  id      String @id @default(cuid())
  name    String
  sppgId  String @map("sppg_id")
  sppg    Sppg   @relation(fields: [sppgId], references: [id])

  @@index([sppgId])
  @@map("beneficiaries")
}
```

### Many-to-Many

```prisma
model Order {
  id         String      @id @default(cuid())
  supplierId String      @map("supplier_id")
  supplier   Supplier    @relation(fields: [supplierId], references: [id])
  items      OrderItem[]

  @@index([supplierId])
  @@map("orders")
}

model OrderItem {
  id       String       @id @default(cuid())
  orderId  String       @map("order_id")
  order    Order        @relation(fields: [orderId], references: [id])
  itemId   String       @map("item_id")
  item     SupplierItem @relation(fields: [itemId], references: [id])
  quantity Float

  @@index([orderId])
  @@index([itemId])
  @@map("order_items")
}
```

---

## Migration Workflow

### 1. Edit Schema

```bash
# Edit prisma/schema.prisma
# Tambahkan model atau update model
```

### 2. Create Migration

```bash
pnpm prisma:migrate
# Atau
pnpm prisma migrate dev --name add_supplier_table
```

### 3. Review Migration SQL

```sql
-- Migration: 20260709_add_supplier_table
CREATE TABLE "suppliers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "npwp" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "suppliers_npwp_key" ON "suppliers"("npwp");
```

### 4. Apply Migration

```bash
pnpm prisma migrate deploy
```

---

## Soft Delete Pattern

### Schema

```prisma
model Supplier {
  id        String    @id @default(cuid())
  name      String
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("suppliers")
}
```

### Query

```typescript
// Find all non-deleted
const suppliers = await prisma.supplier.findMany({
  where: {
    deletedAt: null,
  },
});

// Soft delete
await prisma.supplier.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Restore
await prisma.supplier.update({
  where: { id },
  data: { deletedAt: null },
});
```

---

## Checklist

- [ ] Gunakan snake_case untuk nama tabel
- [ ] Gunakan @map untuk mapping nama tabel
- [ ] Gunakan @id @default(cuid()) untuk primary key
- [ ] Gunakan @default(now()) untuk created timestamp
- [ ] Gunakan @updatedAt untuk updated timestamp
- [ ] Buat index untuk foreign key
- [ ] Buat index untuk frequently queried columns
- [ ] Review migration SQL sebelum apply
- [ ] Test migration di development dulu

---

## Anti-Patterns

```
❌ Table name pakai PascalCase
model Supplier { }  // Akan generate "Supplier" table

✅ Table name pakai snake_case
model Supplier {
  @@map("suppliers")
}

❌ Tidak ada index di foreign key
model SupplierItem {
  supplierId String
  supplier   Supplier @relation(fields: [supplierId], references: [id])
}

✅ Ada index di foreign key
model SupplierItem {
  supplierId String
  supplier   Supplier @relation(fields: [supplierId], references: [id])
  
  @@index([supplierId])
}

❌ Tidak pakai @map untuk column
model Supplier {
  basePrice Float  // Akan generate "basePrice" column
}

✅ Pakai @map untuk column
model Supplier {
  basePrice Float @map("base_price")  // Generate "base_price" column
}
```

---

## References

- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/best-practices)
- [docs/DATABASE.md](../../DATABASE.md)
- [docs/backend/MCP.md](../MCP.md)
