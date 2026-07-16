# Backend Development Guide

## Role: @backend

Anda adalah **Backend Agent** yang bekerja di `apps/backend/`.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | NestJS | ^10.3.0 |
| ORM | Prisma | ^5.10.0 |
| Database | PostgreSQL | 16 |
| Auth | JWT + Passport | ^0.7.0 |
| Validation | class-validator | ^0.14.1 |

---

## Project Structure

```
apps/backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── database/
│   │   ├── prisma.module.ts       # Prisma module
│   │   └── prisma.service.ts      # Prisma service
│   └── modules/
│       ├── auth/                  # SSO BGN + JWT
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── jwt.strategy.ts
│       │   └── jwt-auth.guard.ts
│       ├── supplier/              # CRUD Supplier
│       ├── batch/                 # QR Traceability
│       ├── complaint/             # Keluhan
│       ├── market/                # Dynamic Median
│       └── reports/               # Auto-generate laporan
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data
└── package.json
```

---

## Key Files to Know

### 1. Database Schema
```
prisma/schema.prisma
```
- Semua models ada di sini
- Jalankan `pnpm prisma:migrate` setelah ubah schema

### 2. API Controllers
```
src/modules/*/controllers/*.controller.ts
```
- Handle HTTP requests
- Gunakan decorators: `@Get()`, `@Post()`, `@Put()`, `@Delete()`

### 3. Services
```
src/modules/*/services/*.service.ts
```
- Business logic
- Database queries via Prisma

### 4. Auth Guard
```
src/modules/auth/jwt-auth.guard.ts
```
- Protected routes: `@UseGuards(JwtAuthGuard)`
- Get user: `@Request() req` → `req.user`

---

## Common Tasks

### 1. Add New Endpoint

```typescript
// 1. Create service method
// src/modules/supplier/supplier.service.ts
async findAll() {
  return this.prisma.supplier.findMany();
}

// 2. Create controller
// src/modules/supplier/supplier.controller.ts
@Get()
async findAll() {
  return this.supplierService.findAll();
}

// 3. Register in module
// src/modules/supplier/supplier.module.ts
providers: [SupplierService]
```

### 2. Add New Model

```prisma
// 1. Add to schema.prisma
model NewModel {
  id    String @id @default(cuid())
  name  String
  // ...
}

// 2. Run migration
// pnpm prisma:migrate

// 3. Create module, service, controller
```

### 3. Protected Route

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async protectedRoute(@Request() req) {
  const userId = req.user.sub;
  // ...
}
```

### 4. Public Route

```typescript
@Get('public/:id')
async publicRoute(@Param('id') id: string) {
  // No auth required
}
```

---

## API Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

## Database Commands

```bash
# Generate Prisma client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate

# Open Prisma Studio (GUI)
pnpm prisma:studio

# Seed database
pnpm prisma:seed
```

---

## Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Run with coverage
pnpm test:cov
```

---

## Deployment

```bash
# Build
pnpm build

# Start production
pnpm start

# Docker
docker-compose up backend
```

---

## See Also

- [PATTERNS.md](./PATTERNS.md) - Code patterns & conventions
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery protocol
- `docs/API.md` - Full API documentation
- `docs/DATABASE.md` - Database schema
