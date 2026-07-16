# Database Schema - SIGIZI

## ERD (Entity Relationship Diagram)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│    User      │     │    Sppg     │     │    Supplier     │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id          │     │ id          │     │ id              │
│ email       │     │ name        │     │ name            │
│ name        │     │ mitraId     │     │ npwp            │
│ role        │     │ address     │     │ phone           │
│ sppgId (FK) │────▶│ createdAt   │     │ address         │
│ supplierId  │     │ updatedAt   │     │ createdAt       │
│ createdAt   │     └──────┬──────┘     │ updatedAt       │
│ updatedAt   │            │            └────────┬────────┘
└─────────────┘            │                     │
                           │                     │
            ┌──────────────┼─────────────────────┤
            │              │                     │
            ▼              ▼                     ▼
    ┌──────────────┐ ┌─────────────┐   ┌─────────────────┐
    │ Beneficiary  │ │   Batch     │   │ SupplierItem    │
    ├──────────────┤ ├─────────────┤   ├─────────────────┤
    │ id           │ │ id          │   │ id              │
    │ name         │ │ batchNumber │   │ name            │
    │ school       │ │ reportKey   │   │ unit            │
    │ sppgId (FK)  │ │ date        │   │ basePrice       │
    └──────────────┘ │ menu        │   │ supplierId (FK) │
                     │ nutrition   │   └─────────────────┘
                     │ allergens   │
                     │ costPerPort │
                     │ totalCost   │
                     │ sppgId (FK) │
                     │ status      │
                     └──────┬──────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Complaint   │
                    ├──────────────┤
                    │ id           │
                    │ reportKey    │
                    │ description  │
                    │ evidence     │
                    │ status       │
                    │ batchId (FK) │
                    │ createdAt    │
                    └──────────────┘

    ┌──────────────┐
    │    Order     │
    ├──────────────┤
    │ id           │
    │ status       │
    │ total        │
    │ sppgId (FK)  │───▶ Sppg
    │ supplierId   │───▶ Supplier
    │ createdAt    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  OrderItem   │
    ├──────────────┤
    │ id           │
    │ orderId (FK) │
    │ itemId (FK)  │───▶ SupplierItem
    │ quantity     │
    │ unitPrice    │
    │ subtotal     │
    └──────────────┘
```

## Tables

### User
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| email | String | UNIQUE | Email address |
| name | String | NOT NULL | Full name |
| role | Enum | NOT NULL | SPPG_ADMIN, SUPPLIER, PUBLIC |
| sppgId | String | FK → Sppg.id, NULLABLE | Linked SPPG |
| supplierId | String | FK → Supplier.id, NULLABLE | Linked Supplier |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |
| updatedAt | DateTime | AUTO | Updated timestamp |

### Sppg
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | NOT NULL | SPPG name |
| mitraId | String | UNIQUE, NULLABLE | ID from mitra.bgn.go.id |
| address | String | NULLABLE | Address |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |
| updatedAt | DateTime | AUTO | Updated timestamp |

### Supplier
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | NOT NULL | Business name |
| npwp | String | UNIQUE | Tax ID |
| phone | String | NULLABLE | Phone number |
| address | String | NULLABLE | Address |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |
| updatedAt | DateTime | AUTO | Updated timestamp |

### SupplierItem
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | NOT NULL | Item name (e.g., "Beras", "Ayam") |
| unit | String | NOT NULL | Unit (kg, liter, pcs) |
| basePrice | Float | NOT NULL | Base price per unit |
| supplierId | String | FK → Supplier.id | Owner supplier |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |

### Beneficiary
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| name | String | NOT NULL | Beneficiary name |
| school | String | NOT NULL | School name |
| sppgId | String | FK → Sppg.id | Assigned SPPG |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |

### Batch
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| batchNumber | String | UNIQUE | Format: BATCH-YYYYMMDD-XXX |
| reportKey | String | UNIQUE | 8-char alphanumeric for complaints |
| date | DateTime | DEFAULT NOW() | Batch date |
| menu | String | NOT NULL | Menu description |
| nutrition | Json | NULLABLE | { calories, protein, fat, carbs } |
| allergens | String[] | DEFAULT [] | ["gluten", "kacang", "susu"] |
| costPerPortion | Float | NOT NULL | Cost per portion |
| totalCost | Float | NOT NULL | Total batch cost |
| sppgId | String | FK → Sppg.id | Created by SPPG |
| status | Enum | DEFAULT ACTIVE | ACTIVE, COMPLETED, CANCELLED |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |

### Complaint
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| reportKey | String | NOT NULL | Must match batch reportKey |
| description | String | NOT NULL | Complaint text |
| evidence | String | NULLABLE | URL to uploaded file |
| status | Enum | DEFAULT PENDING | PENDING, REVIEWED, RESOLVED |
| batchId | String | FK → Batch.id | Related batch |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |
| updatedAt | DateTime | AUTO | Updated timestamp |

### Order
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| status | Enum | DEFAULT PENDING | PENDING, CONFIRMED, DELIVERED |
| total | Float | NOT NULL | Order total |
| sppgId | String | FK → Sppg.id | Ordering SPPG |
| supplierId | String | FK → Supplier.id | Supplier |
| createdAt | DateTime | DEFAULT NOW() | Created timestamp |
| updatedAt | DateTime | AUTO | Updated timestamp |

### OrderItem
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | String (cuid) | PK | Unique identifier |
| orderId | String | FK → Order.id | Parent order |
| itemId | String | FK → SupplierItem.id | Ordered item |
| quantity | Float | NOT NULL | Quantity ordered |
| unitPrice | Float | NOT NULL | Price at order time |
| subtotal | Float | NOT NULL | quantity × unitPrice |

## Enums

```typescript
enum Role {
  SPPG_ADMIN
  SUPPLIER
  PUBLIC
}

enum BatchStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ComplaintStatus {
  PENDING
  REVIEWED
  RESOLVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  DELIVERED
}
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_batch_date ON "Batch"("date");
CREATE INDEX idx_batch_sppg ON "Batch"("sppgId");
CREATE INDEX idx_batch_number ON "Batch"("batchNumber");
CREATE INDEX idx_complaint_batch ON "Complaint"("batchId");
CREATE INDEX idx_complaint_status ON "Complaint"("status");
CREATE INDEX idx_order_sppg ON "Order"("sppgId");
CREATE INDEX idx_order_supplier ON "Order"("supplierId");
CREATE INDEX idx_supplier_item_supplier ON "SupplierItem"("supplierId");
CREATE INDEX idx_user_sppg ON "User"("sppgId");
CREATE INDEX idx_user_supplier ON "User"("supplierId");
```
