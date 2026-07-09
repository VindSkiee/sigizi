---
description: Seed the database with sample data
agent: backend
---

# Seed Database

Run the following commands to seed the database with sample data:

```bash
# Navigate to backend
cd apps/backend

# Run seed script
pnpm prisma:seed
```

The seed script will create:
- 1 SPPG (Sistem Penyedia Pangan Gabungan)
- 1 Admin user
- 3 Suppliers with items
- 3 Beneficiaries
- 2 Batches
- 1 Complaint

Verify by checking the database:
```bash
pnpm prisma:studio
```
