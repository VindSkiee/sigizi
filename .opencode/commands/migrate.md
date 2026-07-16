---
description: Run Prisma migrations and generate client
agent: backend
---

# Database Migration

Run the following commands to set up the database:

```bash
# Navigate to backend
cd apps/backend

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Verify migration status
pnpm prisma migrate status
```

After migration, verify:
1. Database tables are created
2. No migration errors
3. Prisma client is generated

If starting fresh, run `pnpm prisma:seed` to populate with sample data.
